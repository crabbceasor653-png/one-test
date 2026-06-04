# AGENTS.md

## 工作入口

本项目是纯前端网页版植被拼贴编辑器。后续开发前，请先阅读本文件，再按相关标准文件执行。

## 标准文件路径

- 产品需求：`docs/product-requirements.md`
- 技术架构：`docs/technical-architecture.md`
- 设计规范：`docs/design-guidelines.md`
- 核心数据结构：`docs/core-data-structures.md`
- 分阶段开发计划：`docs/development-plan.md`
- 开发工作流：`docs/development-workflow.md`
- 开发日志说明：`dev-logs/README.md`
- 日志模板：`dev-logs/daily-log-template.md`
- 每日日志：`dev-logs/daily/YYYY-MM-DD.md`

## 项目推进原则

- 不要一口气做太多。
- 每次只推进一个清晰的小阶段。
- 先确认当前阶段，再修改代码。
- 先保证稳定可运行，再增加复杂功能。
- 不做与当前阶段无关的重构。
- 遇到设计取舍时，优先照顾非专业用户的清晰操作体验。

## 每次开发开始前

1. 阅读 `docs/development-plan.md`。
2. 阅读当天开发日志 `dev-logs/daily/YYYY-MM-DD.md`。
3. 如果当天日志不存在，按 `dev-logs/daily-log-template.md` 创建。
4. 明确本次开发目标属于哪个阶段。

## 每次开发结束前

1. 运行与本次改动匹配的验证命令。
2. 更新当天开发日志。
3. 在日志中记录已完成事项、验证结果、待办事项和风险备注。
4. 最终回复用户时简要说明本次完成内容和下一步建议。

## 第一版技术方向

- React + TypeScript。
- Vite 作为构建工具。
- Konva.js / react-konva 作为画布编辑基础。
- lucide-react 作为图标库。
- 第一版不接入后端。
- 第一版不引入复杂素材管理系统。

## 第一版优先级

1. 项目可运行。
2. PNG 上传与透明背景保留。
3. 画布放置图片。
4. 拖动、缩放、旋转。
5. 属性面板。
6. 图层管理。
7. 复制、删除。
8. 导出 PNG。
9. 多选和组合基础能力。

## UI 方向

- 参考用户提供的暗色编辑器界面。
- 左侧素材栏，中间主画布，右侧图层与属性面板。
- 使用绿色作为主要强调色。
- 界面应简洁、直接，适合非专业用户。
