// components/visualizations/VisualizationController.jsx
'use client'
import ComparisonChart from './ComparisonChart';
import TrendChart from './TrendChart';
import SentimentChart from './SentimentChart';
import RelationshipGraph from './RelationshipGraph';

export default function VisualizationController({ type, data }) {
  // Render different visualization components based on type
  switch (type) {
    case 'comparison':
      return <ComparisonChart data={data} entities={data.entities} />;
    case 'trend':
      return <TrendChart data={data} />;
    case 'sentiment':
      return <SentimentChart data={data} />;
    case 'relationship':
      return <RelationshipGraph data={data} />;
    default:
      return (
        <div className="h-60 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-400">Unknown visualization type: {type}</p>
        </div>
      );
  }
}