command_not_found_handle() {
  echo "$1: command not found"
}

commands=$(compgen -cb | sed -e "s/^exit$//" -e "s/^enable$//" -e "s/^alias$//" -e "s/^echo$//")
for cmd in $commands; do
  enable -n $cmd 2>/dev/null
  alias $cmd="echo $cmd: command not found"
done
alias alias="echo alias: command not found"
enable -n alias
enable -n enable

PS1="test> "
