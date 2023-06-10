const fs = require('fs');
const dns = require('dns');

const validDomains = [];
const invalidDomains = [];

function readEmailsCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const lines = data.split('\r\n');
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        rows.push(lines[i]);
      }

      resolve(rows);
    });
  });
}

// Validate email address by RegExp
function validateEmailAddressFormat(email) {
	// const emailRegex = /^(?!\.)[a-zA-Z0-9._%+-]+@(?!-)(?:[a-zA-Z0-9-]{0,63}[a-zA-Z0-9]\.){1,126}(?![0-9]+$)(?!-)[a-zA-Z0-9-]{1,63}\.[a-zA-Z]{2,}$/;
	const emailRegex = /^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/
	return emailRegex.test(email);
}

// Returns email address domain
function getEmailAddressDomain(email) {
	return email.split('@')[1];
}

// Query MX records for a domain
function queryMXRecords(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (error, records) => {
      if (error) {
				invalidDomains.push(domain);
        reject(error);
      } else {
				if(records.length > 0) {
					validDomains.push(domain);
					resolve(records);
				}
				invalidDomains.push(domain);
				reject();
      }
    });
  });
}

// validate Domain
function validateDomain(domain) {
	if(!(domain in validDomains || domain in invalidDomains)) {
		queryMXRecords(domain).then((records) => console.log(records));
	}
	return true;
}

// queryMXRecords('yahoo.com').then((records) => console.log(records));

function validateEmail(email) {
	const validAddressFormat = validateEmailAddressFormat(email);
	const domain = getEmailAddressDomain(email);
	const validDomain = validateDomain(domain);
	return validAddressFormat;
}

// Global validation function
(function validateEmailList() {
	readEmailsCSVFile('emaillist.csv')
  .then((emails) => {
    const validEmails = [];
		emails.forEach(email => { if(validateEmail(email)) validEmails.push(email) });
		console.log("All Emails: ", emails.length, ", Valid Emails: ", validEmails.length);
		console.log("valid Domains: ", validDomains.length, ", invalid Domains: ", invalidDomains.length);
  }).catch((error) => {
    console.error(error);
  });
})();

