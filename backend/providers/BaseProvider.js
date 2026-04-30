export default class BaseProvider {
  async generateTestCases() {
    throw new Error("Not implemented");
  }

  async generateDefectReport() {
    throw new Error("Not implemented");
  }
}
