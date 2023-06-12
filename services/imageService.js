const storage = require("../firebase")
const { ref, uploadBytes, deleteObject } = require("firebase/storage")

const metadata = {
  contentType: 'image/png'
}

class ImageService {
  getRef(path) {
    return ref(storage, `/images/${path}`);
  }


  async deleteFromFirebase(path) {
    const storageRef = this.getRef(path);
    await deleteObject(storageRef)
  }

  async uploadToFirebase(path, data) {
    const storageRef = this.getRef(path);
    await uploadBytes(storageRef, data, metadata);
  }
}

module.exports = new ImageService();