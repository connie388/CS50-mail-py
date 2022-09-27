document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('click',send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view-h3').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  
  fetch('/emails/'+mailbox)
  .then(response=>response.json())
  .then(mails=>
    {
      document.querySelector('#mails').innerHTML = ``;
      mails.forEach(mail => {
        li = `<td>${mail.sender}</td>
              <td>${mail.subject}</td>        
              <td>${mail.timestamp}</td>`;
        
        console.log(li);
        const element=document.createElement('tr');
        element.innerHTML=li;
        // const backgroundColor = element.style.backgroundColor;
        // if (mail.read)
        //   element.backgroundColor=lightgrey;
        // else
        //   element.style.backgroundColor=white;

        element.addEventListener('click',function(){ email(mail.id); });
        document.querySelector('#mails').appendChild(element);
      });

    })    //print data to console
  .catch(err => console.log('Request Failed', err)); // Catch errors
}

function email(email_id) {
    // Show the mail and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  // Show the mail
  fetch('/emails/'+ email_id)
  .then(response=>response.json())
  .then(mail=>{
    console.log(mail);
    document.querySelector('#from').innerHTML='<b>From: </b>'+ mail.sender;
    document.querySelector('#to').innerHTML='<b>To: </b>' + mail.recipients;
    document.querySelector('#subject').innerHTML='<b>Subject: </b>' + mail.subject;
    document.querySelector('#timestamp').innerHTML=`<b>Timestamp: </b>${mail.timestamp}`;
    
    if (!mail.read)
      markAsRead(mail, True);

    const replyButton=document.createElement('button');
    replyButton.className="btn btn-primary";
    replyButton.innerHTML=`Reply`;
    replyButton.addEventListener('click',function(){ reply(mail); });
    document.querySelector('#action-group').appendChild(replyButton);

    const archiveButton=document.createElement('button');
    archiveButton.className="btn btn-primary";
    archiveButton.innerHTML=mail.archived? `Unarchive`:`Archive`;
    archiveButton.addEventListener('click',function(){ toggleArchive(mail); });
    document.querySelector('#action-group').appendChild(archiveButton);

    const unreadButton=document.createElement('button');
    unreadButton.className="btn btn-primary";
    unreadButton.innerHTML= `Unread`;
    unreadButton.addEventListener('click',function(){ markAsRead(mail,False); });
    document.querySelector('#action-group').appendChild(unreadButton);

    document.querySelector("#body").innerHTML=mail.body;
  })
  .catch(err => console.log('Request Failed', err)); // Catch errors
}

function send_mail() {
   fetch('/emails',{method:'POST',body:JSON.stringify({recipients:document.querySelector('#compose-recipients').value, 
   subject:document.querySelector('#compose-subject').value, body:document.querySelector('#compose-body').value})})
  .then(response=>response.json())
  .then(json =>{
      if (json.Status==201) {
        alert(json);
        load_mailbox('sent');
      }
      alert(json);

  })
  .catch(err => console.log('Request Failed', err)); // Catch errors
}

function markAsRead(mail, trueOrFalse) {
  fetch('emails/'+mail.id, {
    method:'PUT',
    body:JSON.stringify({
      read:trueOrFalse
    })
  })
  .catch(err => console.log('Request Failed', err)); // Catch errors
}

function toggleArchive(mail) {
  fetch('emails/'+mail.id, {
    method:'PUT',
    body:JSON.stringify({
      archived:!mail.archived
    })
  })
  .then (()=>load_mailbox('inbox'))
  .catch(err => console.log('Request Failed', err)); // Catch errors
}

function reply(mail) {
 // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = mail.sender;
  document.querySelector('#compose-subject').value = mail.subject;
  document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.sender} wrote: \n${mail.body}`;
}