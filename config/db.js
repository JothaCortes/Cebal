import Cloudant from 'cloudant'
import dotEnv from 'dotenv'

dotEnv.load()

const me = process.env.CLOUDANT_USER
const password = process.env.CLOUDANT_PASSWORD

const cloudant = Cloudant({account: me, password: password, plugin: 'retry', retryAttempts: 5, retryTimeout: 1000})
export default cloudant


