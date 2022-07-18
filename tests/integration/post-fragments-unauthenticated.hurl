# tests/integration/post-fragments.hurl
# Unauthenticated POST to /v1/fragments

POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
```This is a fragment!```

HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" isString
jsonpath "$.error.message" == "Unauthorized"
jsonpath "$.error.code" == 401 
