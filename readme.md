# Access token and referest token =>

The access token is used to authenticate API requests to access protected resources,
while the refresh token is used to obtain new 'access tokens' once the current ones expire.

# login user autentication check: -

1. req.body => data {username, email}
2. username or email for login request.
3. find the user
4. password check
5. access and refresh token
6. mostly token send in cookie send

# Jwt => `JSON web token` https://jwt.io/introduction

In its compact form, JSON Web Tokens consist of three parts separated by dots (.),
Header
Payload
Signature
Therefore, a JWT typically looks like => xxxxx.yyyyy.zzzzz

1. JWT is used for authentication and authorization, allowing the transmission of user information securely between parties.

2. bcrypt is used for password encryption, ensuring that passwords are securely stored in a hashed format in the database.

Authorization: Brarer <token>

The $set operator replaces the value of a field with the specified value.
{ $set: { <field1>: <value1>, ... } }
field1 => the field which value going to be changed
value1 => the new value for the field
