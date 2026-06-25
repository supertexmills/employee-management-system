export class EmailProvider {
  async send(_message) {
    throw new Error("Not implemented");
  }

  async verify() {
    return true;
  }
}
