const axios = require('axios')

module.exports = async function(fileName) {
  const assetsApiUrl = (await axios.get(`https://api.github.com/repos/Electra-project/storage/releases`)).data[0].assets_url
  const asset = (await axios.get(assetsApiUrl)).data.filter(({ name }) => name === fileName)[0]

  return asset
}
