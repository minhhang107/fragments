# tests/integration/post-fragments.hurl
# Authenticated POST unsupported type to /v1/fragments

POST http://localhost:8080/v1/fragments

Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/css
```This is a css!```

HTTP/1.1 415
