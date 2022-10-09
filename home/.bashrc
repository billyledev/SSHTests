command_not_found_handle() {
  echo "$1: command not found"
}

commands=$(compgen -cb)
for cmd in $commands; do
  if [ "$cmd" != "exit" ] && [ "$cmd" != "enable" ] && [ "$cmd" != "alias" ] && [ "$cmd" != "echo" ]; then
    enable -n $cmd 2>/dev/null
    alias $cmd="echo $cmd: command not found"
  fi
done
enable -n enable

PS1="test> "
