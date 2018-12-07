var jwt = require("jsonwebtoken");
var ethUtil = require('ethereumjs-util');
function checkSig(req, res) {
    var sig = req.sig;
    var owner = req.owner;
    // Same data as before
    var data = "i am a string";
    var message = ethUtil.toBuffer(data)
    var msgHash = ethUtil.hashPersonalMessage(message)
    // Get the address of whoever signed this message  
    var signature = ethUtil.toBuffer(sig)
    var sigParams = ethUtil.fromRpcSig(signature)
    var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
    var sender = ethUtil.publicToAddress(publicKey)
    var addr = ethUtil.bufferToHex(sender)

    // Determine if it is the same address as 'owner' 
    var match = false;
    if (addr == owner) { match = true; }
    if (match) {
        // If the signature matches the owner supplied, create a
        // JSON web token for the owner that expires in 24 hours.
        var token = jwt.sign({ user: req.body.addr }, "i am another string", { expiresIn: "1d" });
        res.send(200, { success: 1, token: token })
    } else {
        // If the signature doesn’t match, error out
        res.send(500, { err: "Signature did not match." });
    }
}
function auth(req, res, next) {
    jwt.verify(req.body.token, "i am another string", function(err, decoded) {
      if (err) { res.send(500, { error: "Failed to authenticate token."}); }
      else {
        req.user = decoded.user;
        next();
      };
    });
  }
