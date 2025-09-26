# Legacy Analytics System

This folder contains the original analytics implementations that were developed before the Supabase integration. These are kept for reference and backward compatibility.

## 📁 Files in this folder:

### **Core Analytics**
- `claude_analytics.py` - Original analytics system for `.claude.json` files
- `claude_analytics_visualizer.py` - Visualization dashboard generator
- `codelens_objective_metrics.py` - Objective metrics implementation

### **Generated Reports** (from previous runs)
- `claude_analytics_dashboard.png` - Sample dashboard visualization
- `claude_analytics_detailed_report.txt` - Text-based analysis report
- `claude_analytics_report.json` - Raw analytics data

### **Advanced Features**
- `live_suggestion_system.py` - Real-time prompting assistance system
- `research_collection_script.py` - Anti-pattern research collection

## 🚀 **How to use:**

### Run Original Analytics
```bash
python claude_analytics.py
```
This analyzes `.claude.json` files and generates insights.

### Generate Visualizations
```bash
python claude_analytics_visualizer.py
```
Creates charts and visual reports.

### Test Live Suggestions
```bash
python live_suggestion_system.py
```
Prototype of real-time prompting assistance.

## ⚠️ **Important Notes:**

1. **These are legacy implementations** - For new projects, use the `supabase_integration/` folder
2. **Still functional** - All scripts work for analyzing historical data
3. **No real-time updates** - These work with static `.claude.json` files
4. **Subjective scoring** - Some of these use arbitrary metrics (which we improved in the new system)

## 🔄 **Migration to New System:**

If you want to upgrade from this legacy system:

1. **Use Supabase Integration** - Go to `../supabase_integration/`
2. **Real-time updates** - New system provides live team coordination
3. **Objective metrics** - No more subjective scoring
4. **Better architecture** - Proper backend/frontend separation

## 📚 **Historical Context:**

These files represent the evolution of the CodeLens analytics system:

1. **Phase 1**: Basic `.claude.json` parsing (`claude_analytics.py`)
2. **Phase 2**: Visualization and dashboards (`claude_analytics_visualizer.py`)
3. **Phase 3**: Objective metrics without subjective scoring (`codelens_objective_metrics.py`)
4. **Phase 4**: Live suggestions and real-time features (`live_suggestion_system.py`)
5. **Phase 5**: Complete Supabase integration (moved to `../supabase_integration/`)

The new Supabase integration represents the culmination of all these learnings in a production-ready system.
