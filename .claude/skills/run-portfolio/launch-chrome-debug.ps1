param(
  [int]$Port = 9222,
  [string]$ProfileDir = "$env:TEMP\claude\chrome-devtools-profile"
)

# A distinct --user-data-dir is required: if Chrome is already running under
# the normal profile, launching chrome.exe with --remote-debugging-port and
# no separate profile just opens a tab in the existing process and silently
# ignores the flag. See SKILL.md Gotchas.
Start-Process 'chrome.exe' -ArgumentList "--remote-debugging-port=$Port", "--user-data-dir=$ProfileDir"
