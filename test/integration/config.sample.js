exports.onlineUrl = 'https://[tenant].sharepoint.com/';
exports.onpremAdfsEnabledUrl = '[sharepint on premise url with adfs configured]';
exports.onpremNtlmEnabledUrl = '[sharepint on premise url with ntlm]';

exports.onlineCreds = {
  username: '[username]',
  password: '[password]'
};

exports.onpremCreds = {
  username: '[username]',
  password: '[password]',
  domain: 'sp'
};

exports.onpremAddinOnly = {
  clientId: '[clientId]',
  issuerId: '[issuerId]',
  realm: '[realm]',
  rsaPrivateKeyPath: '[rsaPrivateKeyPath]',
  shaThumbprint: '[shaThumbprint]'
};

exports.onlineAddinOnly = {
  clientId: '[clientId]',
  clientSecret: '[clientSecret]',
  realm: '[realm]'
};
