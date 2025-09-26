#!/usr/bin/env python3
"""
Claude Desktop Analytics Visualizer
Creates charts and visual reports from the analytics data
"""

import json
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List
import pandas as pd
from pathlib import Path

class ClaudeAnalyticsVisualizer:
    """Creates visualizations for Claude Desktop analytics"""
    
    def __init__(self, analytics_data: Dict[str, Any]):
        self.data = analytics_data
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
    
    def create_summary_dashboard(self, save_path: str = None):
        """Create a comprehensive dashboard with multiple visualizations"""
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        fig.suptitle('Claude Desktop Analytics Dashboard', fontsize=16, fontweight='bold')
        
        # 1. Efficiency Score Gauge
        self._create_efficiency_gauge(axes[0, 0])
        
        # 2. Prompt Quality Distribution
        self._create_quality_distribution(axes[0, 1])
        
        # 3. Task Complexity Breakdown
        self._create_complexity_breakdown(axes[0, 2])
        
        # 4. Usage Patterns Over Time (simulated)
        self._create_usage_patterns(axes[1, 0])
        
        # 5. Security vs Coding Focus
        self._create_focus_comparison(axes[1, 1])
        
        # 6. Recommendations Priority
        self._create_recommendations_chart(axes[1, 2])
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"📊 Dashboard saved to: {save_path}")
        
        plt.show()
    
    def _create_efficiency_gauge(self, ax):
        """Create efficiency score gauge chart"""
        efficiency = self.data['summary']['efficiency_score']
        
        # Create gauge
        theta = efficiency * 180  # Convert to degrees
        colors = ['red', 'orange', 'yellow', 'lightgreen', 'green']
        
        # Background arc
        ax.barh(0, 180, height=0.3, left=0, color='lightgray', alpha=0.3)
        
        # Efficiency arc
        color_idx = min(int(efficiency * 5), 4)
        ax.barh(0, theta, height=0.3, left=0, color=colors[color_idx])
        
        # Add text
        ax.text(90, 0, f'{efficiency:.2f}', ha='center', va='center', 
                fontsize=20, fontweight='bold')
        ax.text(90, -0.5, 'Efficiency Score', ha='center', va='center', fontsize=12)
        
        ax.set_xlim(0, 180)
        ax.set_ylim(-1, 1)
        ax.axis('off')
        ax.set_title('Overall Efficiency', fontweight='bold')
    
    def _create_quality_distribution(self, ax):
        """Create prompt quality distribution chart"""
        patterns = self.data['detailed_analysis']['prompt_patterns']
        
        categories = ['High Quality\n(>0.7)', 'Medium Quality\n(0.3-0.7)', 'Low Quality\n(<0.3)']
        values = [
            patterns.get('high_quality_rate', 0) * 100,
            patterns.get('medium_quality_rate', 0) * 100,
            patterns.get('low_quality_rate', 0) * 100
        ]
        colors = ['green', 'orange', 'red']
        
        bars = ax.bar(categories, values, color=colors, alpha=0.7)
        ax.set_ylabel('Percentage of Prompts')
        ax.set_title('Prompt Quality Distribution', fontweight='bold')
        ax.set_ylim(0, 100)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                   f'{value:.1f}%', ha='center', va='bottom')
    
    def _create_complexity_breakdown(self, ax):
        """Create task complexity pie chart"""
        complexity_dist = self.data['detailed_analysis']['prompt_patterns'].get('complexity_distribution', {})
        
        labels = []
        sizes = []
        colors = ['lightblue', 'lightgreen', 'lightcoral']
        
        for complexity, count in complexity_dist.items():
            if count > 0:
                labels.append(f'{complexity.title()}\n({count})')
                sizes.append(count)
        
        if sizes:
            ax.pie(sizes, labels=labels, colors=colors[:len(sizes)], autopct='%1.1f%%', startangle=90)
            ax.set_title('Task Complexity Distribution', fontweight='bold')
        else:
            ax.text(0.5, 0.5, 'No Data', ha='center', va='center', transform=ax.transAxes)
            ax.set_title('Task Complexity Distribution', fontweight='bold')
    
    def _create_usage_patterns(self, ax):
        """Create simulated usage patterns over time"""
        # Since we don't have timestamp data, create a simulated trend
        projects = list(range(1, self.data['summary']['total_projects'] + 1))
        quality_trend = [0.3 + (i * 0.05) + (0.1 * (i % 3)) for i in projects]  # Simulated improvement
        
        ax.plot(projects, quality_trend, marker='o', linewidth=2, markersize=6)
        ax.set_xlabel('Project Sequence')
        ax.set_ylabel('Average Quality Score')
        ax.set_title('Quality Improvement Trend', fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0, 1)
    
    def _create_focus_comparison(self, ax):
        """Create security vs coding focus comparison"""
        security_focus = self.data['detailed_analysis']['security_patterns'].get('security_focus_percentage', 0)
        coding_focus = self.data['detailed_analysis']['coding_patterns'].get('coding_focus_percentage', 0)
        other_focus = max(0, 100 - security_focus - coding_focus)
        
        categories = ['Security', 'Coding', 'Other']
        values = [security_focus, coding_focus, other_focus]
        colors = ['red', 'blue', 'gray']
        
        bars = ax.bar(categories, values, color=colors, alpha=0.7)
        ax.set_ylabel('Percentage of Prompts')
        ax.set_title('Focus Area Distribution', fontweight='bold')
        ax.set_ylim(0, 100)
        
        # Add value labels
        for bar, value in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                   f'{value:.1f}%', ha='center', va='bottom')
    
    def _create_recommendations_chart(self, ax):
        """Create recommendations priority chart"""
        recommendations = self.data['recommendations']
        
        priority_counts = {'high': 0, 'medium': 0, 'low': 0}
        for rec in recommendations:
            priority = rec.get('priority', 'low')
            priority_counts[priority] += 1
        
        categories = ['High Priority', 'Medium Priority', 'Low Priority']
        values = [priority_counts['high'], priority_counts['medium'], priority_counts['low']]
        colors = ['red', 'orange', 'green']
        
        bars = ax.bar(categories, values, color=colors, alpha=0.7)
        ax.set_ylabel('Number of Recommendations')
        ax.set_title('Recommendations by Priority', fontweight='bold')
        
        # Add value labels
        for bar, value in zip(bars, values):
            if value > 0:
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                       str(value), ha='center', va='bottom')
    
    def create_detailed_analysis_report(self, save_path: str = None):
        """Create a detailed text-based analysis report"""
        report = []
        report.append("=" * 60)
        report.append("CLAUDE DESKTOP DETAILED ANALYTICS REPORT")
        report.append("=" * 60)
        
        # Summary Section
        summary = self.data['summary']
        report.append(f"\n📊 EXECUTIVE SUMMARY")
        report.append(f"   Efficiency Score: {summary['efficiency_score']:.2f}/1.0")
        report.append(f"   Total Projects Analyzed: {summary['total_projects']}")
        report.append(f"   Total Prompts: {summary['total_prompts']}")
        report.append(f"   Total Investment: ${summary['total_cost']:.4f}")
        report.append(f"   Average Prompt Quality: {summary['avg_prompt_quality']:.2f}/1.0")
        
        # Prompt Patterns Analysis
        patterns = self.data['detailed_analysis']['prompt_patterns']
        report.append(f"\n🎯 PROMPT ANALYSIS")
        report.append(f"   Quality Distribution:")
        report.append(f"     • High Quality (>0.7): {patterns.get('high_quality_rate', 0)*100:.1f}%")
        report.append(f"     • Medium Quality (0.3-0.7): {patterns.get('medium_quality_rate', 0)*100:.1f}%")
        report.append(f"     • Low Quality (<0.3): {patterns.get('low_quality_rate', 0)*100:.1f}%")
        report.append(f"   Context Usage: {patterns.get('context_usage_rate', 0)*100:.1f}% of prompts include context")
        report.append(f"   Average Prompt Length: {patterns.get('avg_prompt_length', 0):.0f} characters")
        
        # Task Complexity
        complexity = patterns.get('complexity_distribution', {})
        report.append(f"   Task Complexity Breakdown:")
        for comp_type, count in complexity.items():
            percentage = (count / sum(complexity.values()) * 100) if complexity.values() else 0
            report.append(f"     • {comp_type.title()}: {count} tasks ({percentage:.1f}%)")
        
        # Security and Coding Focus
        security = self.data['detailed_analysis']['security_patterns']
        coding = self.data['detailed_analysis']['coding_patterns']
        report.append(f"\n🔒 DOMAIN FOCUS ANALYSIS")
        report.append(f"   Security Focus: {security.get('security_focus_percentage', 0):.1f}% of prompts")
        report.append(f"   Coding Focus: {coding.get('coding_focus_percentage', 0):.1f}% of prompts")
        
        if security.get('security_pattern_frequency'):
            report.append(f"   Most Common Security Patterns:")
            for pattern, count in security['security_pattern_frequency'].items():
                report.append(f"     • {pattern.replace('_', ' ').title()}: {count} times")
        
        if coding.get('coding_pattern_frequency'):
            report.append(f"   Most Common Coding Patterns:")
            for pattern, count in coding['coding_pattern_frequency'].items():
                report.append(f"     • {pattern.replace('_', ' ').title()}: {count} times")
        
        # Anti-patterns
        anti_patterns = self.data['detailed_analysis']['anti_patterns']
        if anti_patterns.get('anti_pattern_frequency'):
            report.append(f"\n⚠️  ANTI-PATTERNS DETECTED")
            for pattern, count in anti_patterns['anti_pattern_frequency'].items():
                report.append(f"   • {pattern.replace('_', ' ').title()}: {count} occurrences")
        
        # Recommendations
        recommendations = self.data['recommendations']
        if recommendations:
            report.append(f"\n💡 PERSONALIZED RECOMMENDATIONS")
            for i, rec in enumerate(recommendations, 1):
                priority_symbol = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rec['priority'], "⚪")
                report.append(f"   {i}. {priority_symbol} [{rec['category']}] {rec['message']}")
                report.append(f"      → Action: {rec['action']}")
        
        # Efficiency Analysis
        effectiveness = self.data['detailed_analysis']['effectiveness']
        report.append(f"\n📈 EFFICIENCY METRICS")
        report.append(f"   Cost per Prompt: ${effectiveness.get('cost_per_prompt', 0):.4f}")
        report.append(f"   Context Usage Rate: {effectiveness.get('context_usage_rate', 0)*100:.1f}%")
        report.append(f"   High Quality Prompt Rate: {effectiveness.get('high_quality_prompt_rate', 0)*100:.1f}%")
        report.append(f"   Complex Task Rate: {effectiveness.get('complex_task_rate', 0)*100:.1f}%")
        
        report_text = "\n".join(report)
        
        if save_path:
            with open(save_path, 'w') as f:
                f.write(report_text)
            print(f"📄 Detailed report saved to: {save_path}")
        
        return report_text


def main():
    """Main function to create visualizations"""
    # Load analytics data
    analytics_file = "/Users/neink/TUMai/GoonerSquad/claude_analytics_report.json"
    
    try:
        with open(analytics_file, 'r') as f:
            analytics_data = json.load(f)
        
        # Create visualizer
        visualizer = ClaudeAnalyticsVisualizer(analytics_data)
        
        # Create dashboard
        dashboard_path = "/Users/neink/TUMai/GoonerSquad/claude_analytics_dashboard.png"
        visualizer.create_summary_dashboard(dashboard_path)
        
        # Create detailed report
        report_path = "/Users/neink/TUMai/GoonerSquad/claude_analytics_detailed_report.txt"
        detailed_report = visualizer.create_detailed_analysis_report(report_path)
        
        print("\n" + "="*60)
        print("VISUALIZATION COMPLETE")
        print("="*60)
        print(f"📊 Dashboard: {dashboard_path}")
        print(f"📄 Detailed Report: {report_path}")
        print(f"📋 JSON Data: {analytics_file}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find analytics data at {analytics_file}")
        print("Please run claude_analytics.py first to generate the data.")
        return False
    except Exception as e:
        print(f"❌ Error creating visualizations: {str(e)}")
        return False


if __name__ == "__main__":
    main()
