# Bincode:

Bicode is used to serialize and deserialize data into `Vec<u8>`
The necessary dependencies:
```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
bincode = "1.2.1"
```

In the case of structs we need the following traits:
```rust
use serde::{Serialize, Deserialize};
use bincode;

#[derive(Serialize, Deserialize, Debug)]
pub struct Row {
   pub id: u32,
   pub username: String,
   pub email: String,
 }
```

Serialization:
```rust
let s = String::from_utf8(vec![b'x'; 255]).unwrap();
let s1 = String::from_utf8(vec![b'x'; 32]).unwrap();
let r3: Row = Row{id: 1, username: s, email: s1};
let r3s = bincode::serialize(&r3).unwrap();
println!("Struct size: {:?}", r3s.len());
println!("Struct content: {:?}", r3s);
```

Deserialization:
```rust
let x: i32 = 5;
let xs: Vec<u8> = bincode::serialize(&x).unwrap();
println!("i32 number {} serializes into byte array {:?}", x, xs);
let xd: i32 = bincode::deserialize(&xs).unwrap();
assert_eq!(x, xd);
```