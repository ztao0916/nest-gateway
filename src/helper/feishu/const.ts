/*
 * @Author: ztao
 * @Date: 2024-01-23 22:39:01
 * @LastEditTime: 2024-01-23 22:40:42
 * @Description: 环境变量文件
 */
import { getConfig } from '@/utils';

const { FEISHU_CONFIG } = getConfig();

export const APP_ID = FEISHU_CONFIG.FEISHU_APP_ID;
export const APP_SECRET = FEISHU_CONFIG.FEISHU_APP_SECRET;
