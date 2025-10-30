---
description: 创建或更新项目章程。
---

## 目标

创建或更新项目章程，该章程定义了项目的核心原则、约定和标准。

## 用户输入

```text
$ARGUMENTS
```

您**必须**在继续之前考虑用户输入（如果不为空）。

## 执行步骤

### 1. 加载现有章程模板

从 `.specify/templates/constitution-template.md` 加载章程模板。如果不存在，使用内置的默认模板结构。

### 2. 收集或推导占位符值

识别模板中的所有占位符（格式为 `{{PLACEHOLDER}}`）并：

1. **从用户输入中提取值**：解析 `$ARGUMENTS` 中提供的任何值
2. **从现有项目文件中推导值**：
   - 从 `package.json`、`pyproject.toml`、`Cargo.toml` 等推导项目名称
   - 从 Git 配置或现有文档推导作者信息
   - 从现有代码库推导技术栈
3. **应用智能默认值**：为常见占位符使用合理的默认值
4. **提示缺失的关键值**：如果无法推导关键信息，提示用户

**特殊处理 - 版本控制规则**：
- 如果存在 `{{VERSIONING_RULES}}`，检测项目类型并应用适当的版本控制策略：
  - **语义版本控制**：用于库和API
  - **日历版本控制**：用于应用程序和服务
  - **自定义方案**：基于项目特定需求

### 3. 起草更新的章程内容

使用收集的值填充模板占位符，创建完整的章程文档。确保：

1. **一致性**：所有部分使用一致的术语和约定
2. **完整性**：涵盖所有必要的项目方面
3. **清晰度**：使用清晰、可操作的语言
4. **可维护性**：结构化以便于未来更新

### 4. 传播修正到依赖工件

章程更改可能影响其他项目文档。检查并更新：

#### A. 计划模板 (`plan-template.md`)
- 更新架构原则以反映章程标准
- 调整技术决策框架
- 同步质量门和验收标准

#### B. 规格模板 (`spec-template.md`)
- 更新需求格式以匹配章程约定
- 调整验收标准模板
- 同步术语和定义

#### C. 任务模板 (`tasks-template.md`)
- 更新任务结构以反映章程工作流程
- 调整优先级框架
- 同步完成标准

#### D. 其他命令文件
检查并更新其他 speckit 命令文件中的任何硬编码假设：
- `speckit.analyze.md`
- `speckit.checklist.md`
- `speckit.clarify.md`
- `speckit.implement.md`
- `speckit.plan.md`
- `speckit.specify.md`
- `speckit.tasks.md`

### 5. 生成同步影响报告

创建一个报告，详细说明章程更改的影响：

```markdown
## 章程同步影响报告

### 更新的章程部分
- [列出修改的主要部分]

### 受影响的工件
- **计划模板**: [描述更改]
- **规格模板**: [描述更改]
- **任务模板**: [描述更改]
- **命令文件**: [列出更新的命令]

### 建议的后续行动
- [列出任何需要手动审查的项目]
- [建议验证步骤]
```

### 6. 验证输出

在完成之前验证：

1. **语法正确性**：确保所有 Markdown 语法正确
2. **占位符解析**：验证所有占位符都已正确替换
3. **内部一致性**：检查章程内的矛盾
4. **模板兼容性**：确保更新的模板仍然有效

### 7. 写入更新的章程

将完成的章程写入 `.specify/constitution.md`。如果文件已存在，创建备份。

### 8. 向用户提供最终摘要

提供章程更新过程的摘要：

```markdown
## 章程更新摘要

**更新的部分**：
- [列出修改的主要部分]

**应用的值**：
- 项目名称: [值]
- 版本控制策略: [值]
- [其他关键值]

**传播的更改**：
- [列出更新的依赖文件]

**下一步**：
- 审查更新的章程以确保准确性
- 考虑运行 `/speckit.analyze` 以验证一致性
- 根据需要更新现有功能规格
```

## 章程模板结构

如果没有现有模板，使用此默认结构：

```markdown
# 项目章程

## 项目概述
- **名称**: {{PROJECT_NAME}}
- **描述**: {{PROJECT_DESCRIPTION}}
- **维护者**: {{MAINTAINERS}}

## 核心原则
{{CORE_PRINCIPLES}}

## 技术标准
### 架构原则
{{ARCHITECTURE_PRINCIPLES}}

### 代码标准
{{CODE_STANDARDS}}

### 质量门
{{QUALITY_GATES}}

## 工作流程约定
### 版本控制
{{VERSIONING_RULES}}

### 分支策略
{{BRANCHING_STRATEGY}}

### 发布流程
{{RELEASE_PROCESS}}

## 文档标准
### 规格要求
{{SPEC_REQUIREMENTS}}

### API 文档
{{API_DOCUMENTATION}}

## 质量保证
### 测试策略
{{TESTING_STRATEGY}}

### 性能标准
{{PERFORMANCE_STANDARDS}}

### 安全要求
{{SECURITY_REQUIREMENTS}}

## 协作指南
### 代码审查
{{CODE_REVIEW_PROCESS}}

### 问题跟踪
{{ISSUE_TRACKING}}

### 沟通协议
{{COMMUNICATION_PROTOCOLS}}
```

## 智能默认值

为常见占位符提供这些默认值：

- `{{VERSIONING_RULES}}`: "语义版本控制 (SemVer) - MAJOR.MINOR.PATCH"
- `{{BRANCHING_STRATEGY}}`: "Git Flow - main/develop/feature/release/hotfix"
- `{{CODE_STANDARDS}}`: "遵循语言特定的 linting 规则和格式化约定"
- `{{TESTING_STRATEGY}}`: "单元测试覆盖率 >80%，集成测试用于关键路径"
- `{{QUALITY_GATES}}`: "所有测试通过，代码审查批准，文档更新"

## 错误处理

- 如果无法推导关键值，提示用户而不是使用占位符
- 如果模板文件损坏，回退到内置默认值
- 如果写入失败，提供清晰的错误消息和恢复步骤