const amqp = require('amqplib')

let broker = {}
let connection
let channel

broker.connect = async () => {
  try {
    connection = await amqp.connect(process.env.AMQPURL)
    channel = await connection.createChannel()
    channel.assertQueue('main')
    console.log('connected to message broker')
  } catch (err) {
    console.log(err)
  }
}

broker.send = async (queue, message) => {
  try {
    channel.assertQueue(queue)
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
  } catch (err) {
    console.log(err)
  }
}

broker.listen = async (queue) => {
  try {
    channel.assertQueue(queue)
    channel.consume(queue, function (msg) {
      return msg
    }, { noAck: true })
  } catch (err) {
    console.log(err)
  }
}

module.exports = broker
