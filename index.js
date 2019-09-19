const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const authenticate = require("mm-authenticate")(mongoose);
const { Script } = require('mm-schemas')(mongoose)

const send = (res, status, data) => (res.statusCode = status, res.end(data));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

AWS.config.update({
  'accessKeyId': process.env.MM_AWS_SECRET_KEY_ID,
  'secretAccessKey': process.env.MM_AWS_SECRET_ACCESS_KEY,
});



const s3 = new AWS.S3({
  params: { Bucket: "mechmania2019" }
});

module.exports = authenticate(async (req, res) => {
  const team = req.user;
  console.log(`${team.name} - Getting the compiled log file from S3`);
  if (!team.mostRecentPush) {
    send(res, 404, "You haven't uploaded any bots yet using `mm push`");
    return;
  }

  if (req.url === "/") {
    console.log(team);
    const script = await Script.findbyId(team.latestScript).exec();
    const data = s3
      .getObject({ Key : `compiled/${script}` })
      .createReadStream()
      .on("error", error => {
        console.log(error);
        send(res, 202, "Not Ready Yet");
      });
      res.statusCode = 200;
      data.pipe(res);
  } else {
    const script = req.url.slice(1);

    console.log(`compiled/${script}`);
    const data = s3
      .getObject({ Key: `compiled/${script}` })
      .createReadStream()
      .on("error", error => {
        console.log(error);
        send(res, 202, "Not Ready Yet");
      });
    console.log("script " + script);
    console.log(data);

    res.statusCode = 200;
    data.pipe(res);
  }
});
