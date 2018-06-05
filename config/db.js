import Cloudant from 'cloudant'
import dotEnv from 'dotenv'

dotEnv.load()

const me = process.env.ClOUDANT_USER
const password = process.env.CLOUDANT_PASSWORD

const cloudant = Cloudant({account: me, password: password})
export default cloudant


