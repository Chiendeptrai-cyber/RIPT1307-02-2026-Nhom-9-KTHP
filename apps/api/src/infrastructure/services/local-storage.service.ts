export class LocalStorageService {
  saveFile(_path: string, _content: Buffer): Promise<string> {
    return Promise.resolve('');
  }
}
