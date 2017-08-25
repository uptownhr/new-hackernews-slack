const axios = require('axios'),
  IncomingWebhook = require('@slack/client').IncomingWebhook,
  _ = require('lodash')

const url = process.env.SLACK_WEBHOOK_URL

const webhook = new IncomingWebhook(url);

const send = (item_ids) => {
  console.log('sending', item_ids)

  item_ids.forEach( i => {
    axios.get(`https://hacker-news.firebaseio.com/v0/item/${i}.json`)
      .then(res => {
        const story = res.data
        console.log(story)
        const message = `${story.title} - ${story.url ? story.url : `https://news.ycombinator.com/item?id=${i}`}`
        console.log(message)

        webhook.send(message, function(err, header, statusCode, body) {
          if (err) {
            console.log('Error:', err)
          } else {
            console.log('Received', statusCode, 'from Slack')
          }
        })

      })
  })

}




const listen = function (intervalMil) {
  this.stories = []

  this.start = async () => {
    this.stories = await topStories()

    this.interval = setInterval( async () => {
      const newStories = await topStories()
      const diff =_.difference(newStories, this.stories)
      const new_items = diff.filter( d => this.stories.find )

      if (new_items.length == 0) return //console.log('nothing new')

      this.stories = this.stories.concat(new_items)

      send(new_items)
    }, intervalMil)
  }

  this.stop = () => {
    clearInterval(this.interval)
  }

  return this
}


const app = listen(30000)

app.start()



function topStories () {
  //return [getRandomInt(1,10)]
  return axios.get('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then(res => res.data)
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}