
from datetime import datetime, timezone
import requests
import sys
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import pytz
from dotenv import load_dotenv
load_dotenv()
usCentral = pytz.timezone("US/Central")
raw_date = datetime.now(usCentral)
current_date = raw_date.strftime('%b %d, %Y, %I:%M:%S %p')
SLACK_WEBHOOK = os.environ.get('RELEASE_NOTIFICATION_SLACK_URL')
message = ("A Sample Message")
VERSION = os.environ.get('DEPLOY_TAG')
APPLINK = os.environ.get('FRONTEND_URL')
app_configs = {}
smtp_configs = {}
SMTP_SERVER = os.environ.get('EMAIL_HOST_NAME')
SMTP_PORT = os.environ.get('EMAIL_PORT')
SMTP_USERNAME = os.environ.get('EMAIL_USERNAME')
SMTP_PASSWORD = os.environ.get('EMAIL_PASSWORD')
SMTP_FROM = os.environ.get('EMAIL_FROM_EMAIL')
EMAILS_CC = os.environ.get('EMAIL_CC').split(",")
SMTP_TO = []
SERVER = 'stage'
IT_REVIEW_REQUEST = False
PROD_RELEASE = False

for x in EMAILS_CC:
	SMTP_TO.append(x)
smtp_configs.update(
	{
            'SMTP_SERVER': SMTP_SERVER,
            'SMTP_PORT:': SMTP_PORT,
            'SMTP_USERNAME': SMTP_USERNAME,
            'SMTP_PASSWORD': SMTP_PASSWORD,
            'SMTP_FROM': SMTP_FROM,
            'EMAILS_CC': EMAILS_CC,
            'SMTP_TO': SMTP_TO,
	})
notfication_message_map = {
    'dev': 'deployed to',
    'stage': 'deployed to',
    'prod': 'released on',
    'preprod': 'deployed to',
    'it': 'is ready for review'
}
server_name_tag_map = {

    'dev': 'Dev',
    'stage': 'Staging',
    'prod': 'Production',
    'preprod': 'PreProd',
    'it': 'PreProd'
}


app_configs.update(
    {
        'VERSION': VERSION,
        'APPLINK': APPLINK,
        'SERVER': SERVER,
        'SLACK_WEBHOOK': SLACK_WEBHOOK

    }
)
review_message = "*Hey viaPhoton IT Team*,\nA new version for *Factory-OS* is ready for review on *<{app_link}|{server} >*"
slack_data = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Hey viaPhoton Team*,\nA new version for *Factory-OS* has been successfully {notify_message} *<{app_link}|{server} >*"
			}
		},
	  	{
			"type": "divider"
		},

		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*<{app_link}|Factory OS {version}>*\n \n`{date}, US/Central`\n"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://files.slack.com/files-pri/T45BZAL48-F0469CR9C5B/image.png",
				"alt_text": "viaPhoton FOS"
			}
		},
	  	{
			"type": "divider"
		}
	]
}


def send_slack_message(data, webhook, server):
    if server == 'it':
        data['blocks'][0]['text']['text'] = review_message.format(
            server=server_name_tag_map[server], app_link=app_configs['APPLINK'],)
        data['blocks'][2]['text']['text'] = data['blocks'][2]['text']['text'].format(
            app_link=app_configs['APPLINK'], version=app_configs['VERSION'], notify_message="", date=current_date, server=server_name_tag_map[server])
    else:
        data['blocks'][0]['text']['text'] = data['blocks'][0]['text']['text'].format(
            notify_message=notfication_message_map[server], server=server_name_tag_map[server], app_link=app_configs['APPLINK'],)
        data['blocks'][2]['text']['text'] = data['blocks'][2]['text']['text'].format(
            app_link=app_configs['APPLINK'], version=app_configs['VERSION'], date=current_date, server=server_name_tag_map[server])

    byte_length = str(sys.getsizeof(data))
    headers = {'Content-Type': "application/json",
               'Content-Length': byte_length}
    response = requests.post(webhook, data=json.dumps(data), headers=headers)
    if response:
        print("Sent slack notification")
    else:
        print(
            f"Error sending slack notification: {response.status_code} {response.text}")


def create_email_template(template, configs, server):
    mail_content = template or ""
    out_template = ""
    if len(mail_content) > 100:
        mail_content = mail_content.replace(
            "<%= version %>", app_configs['VERSION'])
        mail_content = mail_content.replace(
            "<%= date %>", raw_date.strftime("%b %d, %Y"))
        mail_content = mail_content.replace(
            "<%= datetime %>", raw_date.strftime("%I:%M:%S %p"))
        mail_content = mail_content.replace(
            "factory_os_url", app_configs['APPLINK'])
        #Setup the MIME
        message = MIMEMultipart()
        message['From'] = configs['SMTP_USERNAME']
        message['To'] = (", ").join(configs['SMTP_TO'])
        # The subject line
        message['Subject'] = '{message} {version}'.format(
            message=" Factory-OS Release Notification", version=app_configs['VERSION'])
        if server == 'it':
            message['Subject'] = '{message} {version}'.format(
            	message="Factory-OS IT Review Notification", version=app_configs['VERSION'])
            mail_content = mail_content.replace(
            	"Deployed on", notfication_message_map['preprod'].title())
            mail_content = mail_content.replace(
            	"<%= server %>", server_name_tag_map['preprod'].title())
        else:
            mail_content = mail_content.replace(
            	"<%= server %>", server_name_tag_map[server].title())
            mail_content = mail_content.replace(
            	"Deployed on", notfication_message_map[server].title())
        message.attach(MIMEText(mail_content, 'html'))
        out_template = message.as_string()
    else:
        print("Invalid template")
    return out_template


def send_email(email):
    print("Starting Session ...")
    try:

        session = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
        print("Session started")
        session.starttls()  # enable security
        # login with mail_id and password
        session.login(SMTP_USERNAME, SMTP_PASSWORD)
        session.sendmail(SMTP_USERNAME, SMTP_TO, email)
        session.quit()
        print('Mail Sent')
    except Exception as err:
        print(f"Error sending Email, Err: {err}")


if len(sys.argv) > 1:
    if sys.argv[1]:
        SERVER = sys.argv[1].lower().strip()
        app_configs['SERVER'] = SERVER
        if SERVER == 'it':
            IT_REVIEW_REQUEST = True
        if SERVER == 'prod':
            PROD_RELEASE = True
        
print(f"Server: {SERVER}")
mail_content = ""

if IT_REVIEW_REQUEST:
    IT_EMAILS_CC = os.environ.get('IT_EMAILS_CC').split(",")
    try:
        for x in IT_EMAILS_CC:
            if x != '':
                if not x in SMTP_TO:
                    SMTP_TO.append(x)
        smtp_configs['SMTP_TO'] = SMTP_TO
        print(smtp_configs['SMTP_TO'])
        with open('./views/emails/it_review.html') as f:
            mail_content = f.read()
        out_email = create_email_template(mail_content, smtp_configs, SERVER)
        send_slack_message(slack_data, app_configs['SLACK_WEBHOOK'], SERVER)
        send_email(out_email)
        print('It review request sent')
    except OSError as e:
        print(f"IT review template not found,Err:{e}")
    except Exception as err:
        print(f"Error sending IT review request notifications,Err:{err}")

elif PROD_RELEASE:
    try:
        IT_EMAILS_CC = os.environ.get('IT_EMAILS_CC').split(",")
        MFG_EMAILS_CC = os.environ.get('MFG_EMAILS_CC').split(",")
        EMAILS_CC = IT_EMAILS_CC + MFG_EMAILS_CC
        send_slack_message(slack_data, app_configs['SLACK_WEBHOOK'], SERVER)
        for x in EMAILS_CC:
            if x != '':
                if not x in SMTP_TO:
                    SMTP_TO.append(x)
        smtp_configs['SMTP_TO'] = SMTP_TO
        print(smtp_configs['SMTP_TO'])
        with open('./views/emails/release.html') as f:
                mail_content = f.read()
        out_email = create_email_template(
            	mail_content, smtp_configs, SERVER)
        send_email(out_email)
    except OSError as e:
        print("Release template not found")
    except Exception as err:
        print(f"Error sending release notifications,Err:{err}")
else:
    send_slack_message(slack_data, app_configs['SLACK_WEBHOOK'], SERVER)
    if app_configs['SERVER'] == 'prod' or app_configs['SERVER'] == 'preprod':
        try:
            with open('./views/emails/release.html') as f:
                mail_content = f.read()
            out_email = create_email_template(
            	mail_content, smtp_configs, SERVER)
            send_email(out_email)
        except OSError as e:
            print("Release template not found")
        except Exception as err:
            print(f"Error sending release notifications,Err:{err}")
