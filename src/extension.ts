// MIT License

// Copyright(c) 2022 Overextended

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import {
  type ExtensionContext,
  extensions,
  workspace,
  commands,
  Uri,
} from 'vscode';
import setPlugin from './setPlugin';
import setLibrary from './setLibrary';
import setNativeLibrary from './setNativeLibrary';
import * as path from 'node:path';
import * as os from 'node:os';
import moveFile from './moveFile';

export const id = 'revolution.cfxlua-vscode';
export const extension = extensions.getExtension(id)!;
export let storagePath = '';

export async function activate(context: ExtensionContext) {
  const game = workspace.getConfiguration('cfxlua').get('game', 'GTAV');
  const storageUri = context.globalStorageUri;
  const sourceUri = Uri.joinPath(extension.extensionUri, 'plugin');
  const platform = os.platform();
  storagePath = storageUri.toString();

  if (platform === 'win32') {
    storagePath = path.join(
      '~',
      storagePath.substring(storagePath.indexOf('AppData')),
    );
  } else if (platform === 'darwin') {
    storagePath = path.join(
      '~',
      storagePath.substring(storagePath.indexOf('Library')),
    );
  }

  await moveFile('plugin.lua', sourceUri, storageUri);
  await moveFile('library', sourceUri, storageUri);

  await setPlugin(true);
  await setLibrary(
    ['runtime', 'natives/CFX-NATIVE', `natives/${game.toUpperCase()}`],
    true,
  );

  context.subscriptions.push(
    commands.registerCommand('cfxlua.game.gtav', () => {
      setNativeLibrary('gtav');
    }),

    commands.registerCommand('cfxlua.game.rdr3', () => {
      setNativeLibrary('rdr3');
    }),
  );
}

export async function deactivate() {
  await setPlugin(false);
  await setLibrary(
    ['runtime', 'natives/CFX-NATIVE', 'natives/GTAV', 'natives/RDR3'],
    false,
  );
}
