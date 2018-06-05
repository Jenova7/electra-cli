const axios = require('axios')

modulde.export = async function(fileName) {
  const assetsApiUrl = (await axios.get(`https://api.github.com/repos/${githubPath}/releases`)).data[0].assets_url
  const asset = (await axios.get(assetsApiUrl)).data.filter(({ name }) => name === fileName)[0]
}
