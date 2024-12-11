import vision from '@google-cloud/vision';
import env from './env';

// Google Cloud Vision API credentials taken from the credentials.json file
const CREDENTIALS = {
    type: "service_account",
    project_id: "culinarygpt",
    private_key_id: "96cdb4693cd2581d489c99e1975fa1d0a6d1b210",
    private_key: env.GOOGLE_VISION_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: env.GOOGLE_VISION_CLIENT_EMAIL,
    client_id: "109158157517386112784",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/culinarygpt-430%40culinarygpt.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

const visionClient = new vision.ImageAnnotatorClient({
    credentials: CREDENTIALS,
});

export default visionClient;

