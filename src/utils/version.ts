import * as path from 'path';
import * as fs from 'fs';
import { isQingLongPanel } from './env';

/**
 * 打印版本
 */
export async function printVersion() {
  const { logger } = await import('./log');
  // fuck you qinglong
  if (process.env.NODE_ENV === 'development' && !isQingLongPanel()) {
    logger.info(`开发版`);
    return;
  }
  let version = '__BILI_VERSION__';
  // 如果 version 被替换，则直接打印
  if (version.includes('.')) {
    logger.info(`当前版本【__BILI_VERSION__】`);
  } else {
    version = '';
  }
  try {
    // 如果没有获取到版本，则尝试获取
    if (!version) {
      version = 'v' + (getVersionByPkg() || getVersionByFile());
      logger.info(`当前版本【${version}】`);
    }
  } catch {}
}

function getVersionByPkg() {
  try {
    return getPkg().version;
  } catch {}
}

function getVersionByFile() {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../version.txt'), 'utf8').trim();
  } catch {}
}

/**
 * 检查版本是否可更新
 * @param version 当前版本
 * @param latestTag 最新版本
 */
export function checkVersion(version: string, latestTag: string) {
  if (version.startsWith('v')) {
    version = version.substring(1);
  }
  if (latestTag.startsWith('v')) {
    latestTag = latestTag.substring(1);
  }
  if (version === latestTag) {
    return false;
  }
  const versionArr = version.split('.').slice(0, 3),
    latestTagArr = latestTag.split('.').slice(0, 3);
  for (let i = 0; i < versionArr.length; i++) {
    const versionNum = parseInt(versionArr[i]),
      latestTagNum = parseInt(latestTagArr[i]);
    if (isNaN(versionNum) || isNaN(latestTagNum)) {
      return true;
    }
    if (versionNum < latestTagNum) {
      return true;
    }
    if (versionNum > latestTagNum) {
      return false;
    }
  }
  return false;
}

function getPkg() {
  try {
    try {
      return require(path.resolve(__dirname, '../package.json'));
    } catch {
      return require(path.resolve(__dirname, '../../package.json'));
    }
  } catch {
    return {};
  }
}
