# 小程序密钥管理（接服务器时参考）

> ⚠️ 本文件为模板，不含任何真实密钥。真实密钥见 `.secret.local`（已被 .gitignore 忽略）。

## 前端（小程序）
- **绝不**在前端代码写 AppSecret。
- `project.config.json` 只放 `appid`。
- 用户登录用 `wx.login()` 拿 `code`，发给后端；后端用 `code + appid + appsecret` 换 `openid`。
- 前端只持有 `openid`/自定义登录态 token，不碰 secret。

## 后端（你考虑接的服务器）
- AppSecret 放后端环境变量或密钥管理服务（如微信云开发环境变量、Docker secret、Vault）。
- 示例（FastAPI 后端）：
  ```python
  import os
  APPID = os.environ["WX_APPID"]
  APPSECRET = os.environ["WX_APPSECRET"]  # 从环境变量读，不写死在代码
  ```
- 用 `code2session` 换 openid：
  ```
  GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=APPSECRET&js_code=CODE&grant_type=authorization_code
  ```

## 安全清单
- [ ] `.secret.local` 未被 git 跟踪（`git status` 不应出现）
- [ ] 前端代码 grep 不到 `8b76...`（真实 secret 片段）
- [ ] 若曾贴给第三方/误提交，去微信公众平台 → 开发 → 开发设置 → 重置密钥
