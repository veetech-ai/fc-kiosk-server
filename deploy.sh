# Functions **********************************************************************************************************************s
# checking env variable function
check_env_var () {
    if [[ $1 == *"$2"* ]]; then
        IFS='='
        read -ra ADDR <<< "$1"
        if (( "${#ADDR[1]}" > 1 )); then
            local -n ref=$3 # by reference variable settings
            ref=${ADDR[1]}
        fi
        IFS=' '
    fi
}

# asking for user input function
ask_for_user_input(){
    if (( "${#1}" < 1 )); then
        read -p "${2}" tmp
        local -n ref=$3 # by reference variable settings
        ref=$tmp
    fi
}

# format notice message
display_notice(){
    dashes='--'
    for (( i=0; i<${#1}; i++ )); do
        dashes="${dashes}-"
    done
    dashes="${dashes}--"

    echo ' '
    echo $dashes
    echo "- $1 -"
    echo $dashes
    echo ' '

    if [[ $2 == *"exit"* ]]; then
        $SHELL
    fi
}
# Functions End ******************************************************************************************************************e
display_notice "Server Deployment Started"

# defining variables
HOST=''
USERNAME=''
PASSWORD=''
REMOTE_DIRECTORY=''

# Reading Vairables from env ******************************************************************************************************s
# Reading env file to get variables
env_file='.env.deploy'
while read -r line; do
    check_env_var $line "HOST" HOST
    check_env_var $line "USERNAME" USERNAME
    check_env_var $line "PASSWORD" PASSWORD
    check_env_var $line "REMOTE_DIRECTORY" REMOTE_DIRECTORY
done < $env_file

# checking env have variables or not. If not then asking from user
ask_for_user_input "$HOST" "Enter Server Host/IP: " HOST
ask_for_user_input "$USERNAME" "Enter Server Username: " USERNAME
ask_for_user_input "$PASSWORD" "Enter Server Password: " PASSWORD
ask_for_user_input "$REMOTE_DIRECTORY" "Enter Host directory here you want to deploy: " REMOTE_DIRECTORY
# Reading Vairables from env end ****************************************************************************************************e

# Building and deploying code to server *********************************************************************************************s
mkdir -p deployment-files
rm -rf ./deployment-files/*
IFS=$'\n'
cp -pv --parents $(git diff --name-only develop) ./deployment-files/
IFS=' '

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    scp_command="sshpass -p $PASSWORD scp -o stricthostkeychecking=no"
    ssh_command="sshpass -p $PASSWORD ssh -o stricthostkeychecking=no"
elif [[ "$OSTYPE" == "msys" ]]; then
    scp_command="pscp -scp -pw $PASSWORD"
    ssh_command="ssh"
else
    display_notice "Sorry! I don't know your Operating System." exit
fi

display_notice "Copying files to server. Please wait...."

if eval "${scp_command} -r ./deployment-files/* ${USERNAME}@${HOST}:~/local-deployment/"; then
    display_notice "Files copied to server. Now, Deploying application. Please wait...."
    if eval "${ssh_command}  ${USERNAME}@${HOST} 'cd  ${REMOTE_DIRECTORY} && git checkout -- . && cp -r -v ~/local-deployment/* ./ && npm rm -f node_modules && npm rm -rf package-lock.json && npm install && npm run db && npm run pm2 && rm -rf ~/local-deployment/*'"; then
        rm -rf ./deployment-files
        display_notice "Deployed" exit
    else
        display_notice "Error in main deployment command. SSH command failed" exit
    fi
else
    # failed to copying files from local server to remote server
    display_notice "Error in copying files to server" exit
fi
# Building and deploying code to server end *****************************************************************************************e