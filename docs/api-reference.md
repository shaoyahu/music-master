# MiniMax 音乐生成 API 文档

> 本文档涵盖音乐生成、翻唱前处理和歌词生成三个接口。

**基础域名**: `https://api.minimaxi.com`

**认证方式**: Bearer Token (HTTP Bearer Auth)

```
Authorization: Bearer {API_KEY}
```

API Key 可在 [账户管理 > 接口密钥](https://platform.minimaxi.com/user-center/basic-information/interface-key) 中查看。

---

## 目录

- [音乐生成](#音乐生成)
- [翻唱前处理](#翻唱前处理)
- [歌词生成](#歌词生成)
- [错误码](#错误码)

---

## 音乐生成

**接口地址**: `POST /v1/music_generation`

**功能**: 输入歌词和歌曲描述，进行歌曲生成。

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | 固定值 `application/json` |

### 请求体

```json
{
  "model": "music-2.6",
  "prompt": "流行音乐, 难过, 适合在下雨的晚上",
  "lyrics": "[Verse]\n街灯微亮晚风轻抚\n...",
  "stream": false,
  "output_format": "hex",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  },
  "aigc_watermark": false,
  "lyrics_optimizer": false,
  "is_instrumental": false,
  "audio_url": "",
  "audio_base64": "",
  "cover_feature_id": ""
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 是 | 使用的模型名称，见下方模型说明 |
| prompt | string | 条件必填 | 音乐描述，用于指定风格、情绪和场景。长度限制见下方说明 |
| lyrics | string | 条件必填 | 歌曲歌词，使用 `\n` 分隔每行。长度限制见下方说明 |
| stream | boolean | 否 | 是否使用流式传输，默认为 `false` |
| output_format | string | 否 | 音频返回格式：`url` 或 `hex`，默认为 `hex`。流式请求时仅支持 `hex` |
| audio_setting | object | 否 | 音频输出配置，见 [AudioSetting](#audio-setting) |
| aigc_watermark | boolean | 否 | 是否在音频末尾添加水印，默认为 `false`，非流式请求时生效 |
| lyrics_optimizer | boolean | 否 | 是否根据 prompt 自动生成歌词，仅 `music-2.6` 系列支持 |
| is_instrumental | boolean | 否 | 是否生成纯音乐（无人声），仅 `music-2.6` 系列支持 |
| audio_url | string | 条件必填 | 参考音频 URL，仅用于 `music-cover` 系列 |
| audio_base64 | string | 条件必填 | Base64 编码的参考音频，仅用于 `music-cover` 系列 |
| cover_feature_id | string | 条件必填 | 翻唱前处理返回的特征 ID，仅用于 `music-cover` 系列 |

#### 模型说明 (model)

| 模型 | 说明 | RPM |
|------|------|-----|
| `music-2.6` | 文本生成音乐，推荐用于 Token Plan 和付费用户 | 较高 |
| `music-cover` | 基于参考音频生成翻唱版本 | 较高 |
| `music-2.6-free` | `music-2.6` 的限免版本，所有用户可用 | 较低 |
| `music-cover-free` | `music-cover` 的限免版本 | 较低 |

#### prompt 长度限制

| 模型/场景 | 必填 | 长度限制 |
|-----------|------|----------|
| `music-2.6` / `music-2.6-free` 纯音乐 | 非必填 | [0, 2000] |
| `music-2.6` / `music-2.6-free` 非纯音乐 | 可选 | [0, 2000] |
| `music-cover` / `music-cover-free` | 必填 | [10, 300] |

#### lyrics 长度限制

| 模型/场景 | 必填 | 长度限制 |
|-----------|------|----------|
| `music-2.6` / `music-2.6-free` 纯音乐 | 非必填 | - |
| `music-2.6` / `music-2.6-free` 非纯音乐 | 必填 | [1, 3500] |
| `music-cover` / `music-cover-free` | 可选（ASR自动提取） | [10, 1000] |

#### 歌词结构标签

支持以下结构标签： `[Intro]`, `[Verse]`, `[Pre Chorus]`, `[Chorus]`, `[Interlude]`, `[Bridge]`, `[Outro]`, `[Post Chorus]`, `[Transition]`, `[Break]`, `[Hook]`, `[Build Up]`, `[Inst]`, `[Solo]`

#### 参考音频要求 (audio_url / audio_base64)

- 时长：6 秒至 6 分钟
- 大小：最大 50 MB
- 格式：mp3、wav、flac 等常见音频格式

### AudioSetting

| 参数 | 类型 | 说明 |
|------|------|------|
| sample_rate | integer | 采样率。可选值：`16000`, `24000`, `32000`, `44100` |
| bitrate | integer | 比特率。可选值：`32000`, `64000`, `128000`, `256000` |
| format | string | 音频编码格式。可选值：`mp3`, `wav`, `pcm` |

### 响应

```json
{
  "data": {
    "status": 2,
    "audio": "hex编码的音频数据"
  },
  "trace_id": "04ede0ab069fb1ba8be5156a24b1e081",
  "extra_info": {
    "music_duration": 25364,
    "music_sample_rate": 44100,
    "music_channel": 2,
    "bitrate": 256000,
    "music_size": 813651
  },
  "analysis_info": null,
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| data.status | integer | 音乐合成状态：1=合成中, 2=已完成 |
| data.audio | string | 音频文件的 16 进制编码字符串（当 output_format 为 hex 时） |
| trace_id | string | 请求追踪 ID |
| extra_info | object | 额外信息，包含 music_duration, music_sample_rate, music_channel, bitrate, music_size |
| base_resp | object | 状态码及详情 |

---

## 翻唱前处理

**接口地址**: `POST /v1/music_cover_preprocess`

**功能**: 对参考音频进行预处理，提取音频特征和歌词，用于两步翻唱流程。

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | 固定值 `application/json` |

### 请求体

```json
{
  "model": "music-cover",
  "audio_url": "https://example.com/song.mp3",
  "audio_base64": ""
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | 是 | 固定值为 `music-cover` |
| audio_url | string | 条件必填 | 参考音频 URL，`audio_url` 和 `audio_base64` 二选一 |
| audio_base64 | string | 条件必填 | Base64 编码的参考音频，二选一 |

#### 参考音频要求

- 时长：6 秒至 6 分钟
- 大小：最大 50 MB
- 格式：mp3、wav、flac 等常见音频格式

### 响应

```json
{
  "cover_feature_id": "a1b2c3d4e5f67890abcdef1234567890",
  "formatted_lyrics": "[Verse 1]\n歌曲第一行\n\n[Chorus]\n这是副歌部分",
  "structure_result": "{\"num_segments\":4,\"segments\":[{\"start\":0,\"end\":15.5,\"label\":\"intro\"},...]}",
  "audio_duration": 90,
  "trace_id": "061e5f144eb7f10b1fdde81126e24f91",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| cover_feature_id | string | 预处理后的音频特征唯一标识，有效期 24 小时 |
| formatted_lyrics | string | ASR 提取并格式化的歌词，包含 `[Verse]`, `[Chorus]`, `[Bridge]` 等段落标签 |
| structure_result | string | JSON 字符串，歌曲结构分析结果，含段落类型（intro, verse, chorus, bridge 等）及其起止时间戳 |
| audio_duration | number | 参考音频的时长（秒） |
| trace_id | string | 请求追踪 ID |

#### 两步翻唱流程

1. 调用翻唱前处理接口，获取 `cover_feature_id`
2. 将 `cover_feature_id` 传入[音乐生成接口](#音乐生成)的 `cover_feature_id` 参数
3. 可修改 `lyrics` 后生成翻唱

> 注意：`cover_feature_id` 有效期为 24 小时，相同音频内容会返回相同的 ID。

---

## 歌词生成

**接口地址**: `POST /v1/lyrics_generation`

**功能**: 生成歌词，支持完整歌曲创作和歌词编辑/续写。

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | 固定值 `application/json` |

### 请求体

```json
{
  "mode": "write_full_song",
  "prompt": "一首关于夏日海边的轻快情歌",
  "lyrics": "",
  "title": ""
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mode | string | 是 | 生成模式：`write_full_song`=写完整歌曲，`edit`=编辑/续写歌词 |
| prompt | string | 否 | 提示词/指令，用于描述歌曲主题、风格或编辑方向。最大长度 2000 |
| lyrics | string | 否 | 现有歌词内容，仅在 `edit` 模式下有效，最大长度 3500 |
| title | string | 否 | 歌曲标题。传入后输出将保持该标题不变 |

### 响应

```json
{
  "song_title": "夏日海风的约定",
  "style_tags": "Mandopop, Summer Vibe, Romance, Lighthearted, Beach Pop",
  "lyrics": "[Intro]\n(Ooh-ooh-ooh)\n阳光洒满了海面\n\n[Verse 1]\n海风轻轻吹拂你发梢...",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

#### 响应参数

| 参数 | 类型 | 说明 |
|------|------|------|
| song_title | string | 生成的歌名 |
| style_tags | string | 风格标签，逗号分隔，如 `Pop, Upbeat, Female Vocals` |
| lyrics | string | 生成的歌词，包含结构标签，可直接用于音乐生成接口的 `lyrics` 参数 |
| base_resp | object | 状态码及详情 |

#### 歌词结构标签

支持以下 14 种结构标签： `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Hook]`, `[Drop]`, `[Bridge]`, `[Solo]`, `[Build-up]`, `[Instrumental]`, `[Breakdown]`, `[Break]`, `[Interlude]`, `[Outro]`

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 请求成功 |
| 1002 | 触发限流，请稍后再试 |
| 1004 | 账号鉴权失败，请检查 API-Key 是否填写正确 |
| 1008 | 账号余额不足 |
| 1026 | 输入包含敏感内容 |
| 2013 | 传入参数异常，请检查入参是否按要求填写 |
| 2049 | 无效的 API Key |

---

## 请求示例

### 音乐生成 (music-2.6)

```bash
curl -X POST 'https://api.minimaxi.com/v1/music_generation' \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "music-2.6",
    "prompt": "独立民谣,忧郁,内省,渴望,独自漫步,咖啡馆",
    "lyrics": "[verse]\n街灯微亮晚风轻抚\n影子拉长独自漫步\n旧外套裹着深深忧郁\n不知去向渴望何处\n[chorus]\n推开木门香气弥漫\n熟悉的角落陌生人看",
    "audio_setting": {
      "sample_rate": 44100,
      "bitrate": 256000,
      "format": "mp3"
    }
  }'
```

### 翻唱前处理

```bash
curl -X POST 'https://api.minimaxi.com/v1/music_cover_preprocess' \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "music-cover",
    "audio_url": "https://example.com/song.mp3"
  }'
```

### 两步翻唱

```bash
curl -X POST 'https://api.minimaxi.com/v1/music_generation' \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "music-cover",
    "prompt": "流行风格,欢快,阳光",
    "lyrics": "[Verse]\n修改后的歌词内容",
    "cover_feature_id": "a1b2c3d4e5f67890abcdef1234567890"
  }'
```

### 歌词生成

```bash
curl -X POST 'https://api.minimaxi.com/v1/lyrics_generation' \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "mode": "write_full_song",
    "prompt": "一首关于夏日海边的轻快情歌"
  }'
```
