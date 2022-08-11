# Authenticated UPDATE non-existing fragment

PUT http://localhost:8080/v1/fragments/invalid-fragment
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/html
```This is an updated fragment!```

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" isString
jsonpath "$.error.message" == "Fragment not found"
jsonpath "$.error.code" == 404

###############################################################################################

# Authenticated UPDATE fragment type

POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
```This is a fragment!```

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/html
```This is an updated fragment!```

HTTP/1.1 400

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" isString
jsonpath "$.error.message" == "A fragment’s type can not be changed after it is created."
jsonpath "$.error.code" == 400

###############################################################################################

# Authenticated UPDATE an existing fragment

POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
```This is a fragment!```

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
```This is an updated fragment!```

HTTP/1.1 200

GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 28

[Asserts]
body == "This is an updated fragment!"





