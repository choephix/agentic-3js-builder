
<invoke name="grep">
<parameter name="pattern">ring\(</parameter>
<parameter name="path">docs/api.md</parameter>
<parameter name="i">Checking ring API</parameter>
</invoke>



<invoke name="bash">
<parameter name="command">pwd; ls; grep -rn "ring" docs/api.md | head -20</parameter>
<parameter name="i">Locating ring docs</parameter>
</invoke>



<invoke name="bash">
<parameter name="command">sed -n 55,100p src/distribute.ts; grep -n "export function toFrame" -A25 src/math.ts</parameter>
<parameter name="i">Reading ring and toFrame</parameter>
</invoke>

<invoke name="bash">
<parameter name="command">cd ~/tmp-archive/sonnet-100 2>/dev/null && ls | head; cd - ; ls ..; grep -n "ring" /dev/null</parameter>
<parameter name="i">Locating sandbox</parameter>
</invoke>

<invoke name="bash">
<parameter name="command">cd ~/tmp-archive/sonnet-100/capybara 2>/dev/null || cd ~/tmp-archive/sonnet-100/*capy* ; pwd; grep -n "ring" docs/api.md | head; sed -n 55,100p src/distribute.ts</parameter>
<parameter name="i">Reading ring API in sandbox</parameter>
</invoke>

<invoke name="bash">
<parameter name="command">ls ~/tmp-archive/sonnet-100/ | head -50</parameter>
<parameter name="i">Listing sandboxes</parameter>
</invoke>




<invoke name="bash">
<parameter name="command">ls ~/tmp-archive 2>&1 | head; ls ~ | head -30</parameter>
<parameter name="i">Exploring home</parameter>
</invoke>



<invoke name="bash">
<parameter name="command">ls -la; ls -la ~/tmp-archive 2>&1 | head</parameter>
<parameter name="i">Listing cwd</parameter>
</invoke>



<invoke name="bash">
<parameter name="command">echo "pwd=$(pwd)"; echo "home=$HOME"; ls /home 2>&1 | head</parameter>
<parameter name="i">Checking environment</parameter>
</invoke>