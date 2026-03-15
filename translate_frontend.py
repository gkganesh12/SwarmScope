import os

translation_map = {
    # Process.vue & Home.vue
    '图谱构建': 'Graph Building',
    '实时知识图谱': 'Real-time Knowledge Graph',
    '节点': 'Nodes',
    '关系': 'Relationships',
    '刷新图谱': 'Refresh Graph',
    '退出全屏': 'Exit Fullscreen',
    '全屏显示': 'Fullscreen',
    '实时更新中...': 'Real-time updating...',
    '图谱数据加载中...': 'Loading graph data...',
    '等待本体生成...': 'Waiting for ontology generation...',
    '等待本体生成': 'Waiting for Ontology Generation',
    '生成完成后将自动开始构建图谱': 'Graph building will start automatically after generation',
    '图谱构建中': 'Graph Building...',
    '数据即将显示...': 'Data will be displayed soon...',
    '构建流程': 'Build Process',
    '本体生成': 'Ontology Generation',
    '接口说明': 'API Description',
    '上传文档后，LLM分析文档内容，自动生成适合舆论模拟的本体结构（实体类型 + 关系类型）': 'After uploading the document, the LLM analyzes the content and automatically generates an ontology structure suitable for simulation (entity types + relationship types).',
    '生成进度': 'Generation Progress',
    '生成的实体类型': 'Generated Entity Types',
    '生成的关系类型': 'Generated Relationship Types',
    '更多关系...': 'more relationships...',
    '基于生成的本体，将文档分块后调用 Zep API 构建知识图谱，提取实体和关系': 'Based on the generated ontology, the document is chunked and the Zep API is called to build a knowledge graph, extracting entities and relations.',
    '等待本体生成完成...': 'Waiting for ontology generation to complete...',
    '构建进度': 'Build Progress',
    '构建结果': 'Build Results',
    '实体节点': 'Entity Nodes',
    '关系边': 'Relation Edges',
    '实体类型': 'Entity Types',
    '构建完成': 'Build Completed',
    '准备进入下一步骤': 'Ready for next step',
    '进入环境搭建': 'Enter Environment Setup',
    '项目信息': 'Project Info',
    '项目名称': 'Project Name',
    '图谱ID': 'Graph ID',
    '模拟需求': 'Simulation Requirements',
    '系统状态': 'System Status',
    '准备就绪': 'Ready',
    '环境搭建': 'Environment Setup',
    '开始模拟': 'Start Simulation',
    '报告生成': 'Report Generation',
    '深度互动': 'Deep Interaction',
    '已完成': 'Completed',
    '进行中': 'Processing',
    '等待中': 'Waiting',
    '构建失败': 'Build Failed',
    '初始化中': 'Initializing',
    
    # Other common
    '没有待上传的文件，请返回首页重新操作': 'No files pending upload, please return to home page.',
    '正在上传文件并分析文档...': 'Uploading files and analyzing document...',
    '本体生成失败': 'Ontology generation failed',
    '项目初始化失败: ': 'Project initialization failed: ',
    '加载项目失败': 'Failed to load project',
    '处理失败': 'Processing failed',
    '正在启动图谱构建...': 'Starting graph build...',
    '图谱构建任务已启动...': 'Graph build task started...',
    '启动图谱构建失败': 'Failed to start graph build',
    '处理中...': 'Processing...',
    '✅ 图谱构建完成，正在加载完整数据...': '✅ Graph build complete, loading full data...',
    
    # Step 1, 2, 3, 4, 5
    '图谱构建已完成，请进入下一步进行模拟环境搭建': 'Graph building complete, please proceed to environment setup',
    '创建模拟失败': 'Failed to create simulation',
    '未知错误': 'Unknown error',
    '双平台并行模拟': 'Dual-platform parallel simulation',
    '自动解析预测需求': 'Auto-parse prediction needs',
    '动态更新时序记忆': 'Dynamically update temporal memory',
    '生成Agent人设': 'Generate Agent Persona',
    '生成模拟配置': 'Generate Simulation Config',
    '准备模拟脚本': 'Prepare Simulation Scripts',
    '准备返回 Step 2，正在关闭模拟...': 'Returning to Step 2, shutting down simulation...',
    '正在关闭模拟环境...': 'Shutting down simulation environment...',
    '模拟环境已关闭': 'Simulation environment closed',
    '关闭模拟环境失败，尝试强制停止...': 'Failed to close simulation environment, attempting forced stop...',
    '模拟已强制停止': 'Simulation forced to stop',
    '正在停止模拟进程...': 'Stopping simulation process...',
    '停止模拟失败:': 'Failed to stop simulation:',
    '✓ 模拟引擎启动成功': '✓ Simulation engine started successfully',
    '✓ 模拟已停止': '✓ Simulation stopped',
    '正在停止模拟...': 'Stopping simulation...',
    '检测到所有平台模拟已结束': 'Detected all platform simulations finished',
    '模拟已完成': 'Simulation completed',
    '加载模拟数据': 'Loading simulation data',
    '自定义模拟轮数': 'Custom simulation rounds',
    '返回上一步': 'Return to previous step'
}

def translate_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig_content = content
        for cn, en in translation_map.items():
            content = content.replace(cn, en)
            
        if content != orig_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
            
    except Exception as e:
        pass
    return False

def main():
    target_dir = '/Users/ganeshkhetawat/SwarmScope/SwarmScope/frontend/src'
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith(('.vue', '.js', '.html')):
                filepath = os.path.join(root, file)
                if translate_file(filepath):
                    print(f"Translated: {filepath}")

if __name__ == '__main__':
    main()
