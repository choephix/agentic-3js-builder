#!/usr/bin/env python3
"""Summarize Gap3 recorded generation, checks, repairs, and request packaging."""
import json
import statistics
from pathlib import Path
import tiktoken

BASE = Path(__file__).resolve().parent
ROUNDS = ("r22asset", "r22norig", "r22lean", "r22cap", "r22nothink")
TOKENIZER = tiktoken.get_encoding("o200k_base")


def records(round_name):
    runs = BASE / "rounds" / round_name / "runs"
    entries = []
    metrics = {}
    for path in sorted(runs.glob("*.json")):
        entry = json.loads(path.read_text())
        build = runs.parent / "builds" / (entry["slug"] + ".ts")
        reply = runs.parent / "replies" / (entry["slug"] + "-1.json")
        if build.exists():
            entry["estimatedCodeTokens"] = len(TOKENIZER.encode(build.read_text()))
            output = entry.get("usage", {}).get("output_tokens", 0)
            entry["outputTokens"] = output
            entry["estimatedNonCodeShare"] = 1 - entry["estimatedCodeTokens"] / output if output else None
            entry["tokenEstimator"] = "tiktoken 0.14.0 o200k_base; non-code residual includes tokenizer mismatch and output overhead, not exact hidden reasoning"
        if reply.exists():
            blocks = json.loads(reply.read_text()).get("body", {}).get("content", [])
            entry["replyHadThinkingBlock"] = any(block["type"] in ("thinking", "redacted_thinking") for block in blocks)
        path.write_text(json.dumps(entry, indent=2) + "\n")
        metrics[entry["slug"]] = {key: entry[key] for key in ("estimatedCodeTokens", "outputTokens", "estimatedNonCodeShare", "tokenEstimator", "replyHadThinkingBlock") if key in entry}
        entries.append(entry)
    result_path = runs.parent / "results.json"
    if result_path.exists():
        results = json.loads(result_path.read_text())
        for entry in results:
            entry.update(metrics.get(entry["slug"], {}))
        result_path.write_text(json.dumps(results, indent=2) + "\n")
    return entries


def distribution(values):
    return {"median": statistics.median(values), "range": [min(values), max(values)]} if values else None


def summarize(round_name):
    initial = records(round_name)
    repairs = records(round_name + "fix") + records(round_name + "fix2")
    latest = {entry["subject"]: (round_name, entry) for entry in initial}
    crashes = []
    for entry in initial:
        check = BASE / "rounds" / round_name / "checks" / (entry["slug"] + ".json")
        if check.exists() and not json.loads(check.read_text()).get("rendered"):
            crashes.append(entry["subject"])
    for suffix in ("fix", "fix2"):
        for entry in records(round_name + suffix):
            latest[entry["subject"]] = (round_name + suffix, entry)
    final_bytes, failed, rendered = [], [], []
    for subject, (source, entry) in latest.items():
        build = BASE / "rounds" / source / "builds" / (entry["slug"] + ".ts")
        if build.exists():
            final_bytes.append(build.stat().st_size)
        check = BASE / "rounds" / source / "checks" / (entry["slug"] + ".json")
        if check.exists() and json.loads(check.read_text()).get("rendered"):
            rendered.append(subject)
        else:
            failed.append(subject)
    generation_spend = sum(entry.get("costUsd") or 0 for entry in initial)
    repair_spend = sum(entry.get("costUsd") or 0 for entry in repairs)
    pilot_path = BASE / (round_name + "-inputs") / "discarded-pilot.json"
    pilot = json.loads(pilot_path.read_text()) if pilot_path.exists() else None
    pilot_spend = pilot["costUsd"] if pilot else 0
    input_dir = BASE / (round_name + "-inputs")
    manifest = json.loads((input_dir / "manifest.json").read_text())
    arm = {
        "round": round_name, "arm": "craft", "effort": "low", "builds": len(initial),
        "generation_requests": sum(entry.get("modelCalls", 1) for entry in initial),
        "redraws": sum(entry.get("redrawCalls", 0) for entry in initial),
        "generation_minutes": distribution([entry["wallMs"] / 60000 for entry in initial]),
        "generation_seconds": distribution([entry["wallMs"] / 1000 for entry in initial]),
        "generation_cost_usd": distribution([entry.get("costUsd") or 0 for entry in initial]),
        "output_tokens": distribution([entry.get("usage", {}).get("output_tokens", 0) for entry in initial]),
        "module_bytes": distribution([entry.get("moduleBytes", 0) for entry in initial]),
        "final_module_kib": distribution([size / 1024 for size in final_bytes]),
        "median_generation_seconds": statistics.median([entry["wallMs"] / 1000 for entry in initial]) if initial else None,
        "median_final_module_kb": statistics.median(final_bytes) / 1024 if final_bytes else None,
        "median_output_tokens": statistics.median([entry.get("usage", {}).get("output_tokens", 0) for entry in initial]) if initial else None,
        "initial_crashes": crashes, "repair_calls": len(repairs), "rendered": len(rendered), "failed": failed,
        "generation_spend_usd": generation_spend, "repair_spend_usd": repair_spend,
        "pipeline_cost_usd": distribution([entry.get("chainCostUsd", entry.get("costUsd") or 0) for _, entry in latest.values()]),
        "total_output_tokens": sum(entry.get("usage", {}).get("output_tokens", 0) for entry in initial + repairs),
        "reply_thinking_blocks": sum(entry.get("replyHadThinkingBlock", False) for entry in initial),
        "estimated_code_tokens": distribution([entry["estimatedCodeTokens"] for entry in initial if "estimatedCodeTokens" in entry]),
        "estimated_non_code_share": distribution([entry["estimatedNonCodeShare"] for entry in initial if entry.get("estimatedNonCodeShare") is not None]),
        "discarded_pilot_spend_usd": pilot_spend,
        "total_spend_usd": generation_spend + repair_spend + pilot_spend,
    }
    report = {
        "arm": arm,
        "packaging": {"source": manifest.get("source"), "prompt_file": manifest.get("promptFile"),
                      "no_rig": manifest.get("noRig"), "requested_thinking": {"type": "disabled"} if round_name == "r22nothink" else {"type": "enabled", "budget_tokens": 10000} if round_name == "r22cap" else {"type": "adaptive"},
                      "effective_thinking": "thinking not requested (gateway omits the thinking param, effort pinned low; API default applies)" if round_name == "r22nothink" else "adaptive + effort low",
                      "hard_thinking_cap_enforced": False,
                      "effort": "low", "max_tokens": 120000, "workers": 12,
                      "removed_sections": "bakeoff/norig-inputs/removed.json" if manifest.get("noRig") else None,
                      "grep_evidence": "bakeoff/gap3-request-audit.json"},
        "discarded_pilot": pilot,
        "label": "C, second draw (adaptive + effort low, budget dropped by gateway)" if round_name == "r22cap" else "thinking not requested (gateway omits the thinking param, effort pinned low; API default applies)" if round_name == "r22nothink" else round_name,
        "per_build_token_evidence": [{"subject": entry["subject"], "reply_had_thinking_block": entry.get("replyHadThinkingBlock"), "output_tokens": entry.get("outputTokens"), "estimated_code_tokens": entry.get("estimatedCodeTokens"), "estimated_non_code_share": entry.get("estimatedNonCodeShare")} for entry in initial],
        "subjects": list(latest),
        "checks": "npm run bakeoff -- check <round> --skip-typecheck --concurrency 2; up to two full-module repair requests",
    }
    (input_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    return arm


if __name__ == "__main__":
    arms = [summarize(round_name) for round_name in ROUNDS]
    total = sum(arm["total_spend_usd"] for arm in arms)
    probe_path = BASE / "r22cap-inputs" / "thinking-probe.json"
    probe_spend = 0
    if probe_path.exists():
        used = json.loads(probe_path.read_text())["response"]["body"].get("usage", {})
        probe_spend = (used.get("input_tokens", 0) * 2 + used.get("output_tokens", 0) * 10) / 1e6
    no_think_probe_path = BASE / "r22nothink-inputs" / "thinking-disabled-probe.json"
    if no_think_probe_path.exists():
        used = json.loads(no_think_probe_path.read_text())["response"]["body"].get("usage", {})
        probe_spend += (used.get("input_tokens", 0) * 2 + used.get("output_tokens", 0) * 10) / 1e6
    for arm in arms:
        print(json.dumps(arm))
    print(json.dumps({"total_arm_spend_usd": total, "probe_spend_usd": probe_spend, "total_spend_usd": total + probe_spend}))
