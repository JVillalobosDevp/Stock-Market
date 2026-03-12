import { Banner } from '../components/Banner';
import { MarketStats } from '../components/MarketStats';
import { ProjectionPanel } from '../components/ProjectionPanel';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { SentimentScore } from '../components/SentimentScore';
import { TelegramNotifications } from '../components/TelegramNotifications';
import { AIOpportunities } from '../components/AIOpportunities';

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <Banner />
      <MarketStats />
      <ProjectionPanel />
      <ScenarioSimulator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentScore />
        <div className="space-y-6">
          <TelegramNotifications />
          <AIOpportunities />
        </div>
      </div>
    </div>
  );
}
