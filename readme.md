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

# Jwt token coming from header

Authorization: Brarer <token>

The $set operator replaces the value of a field with the specified value.
{ $set: { <field1>: <value1>, ... } }
field1 => the field which value going to be changed
value1 => the new value for the field
