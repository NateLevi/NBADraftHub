import BioDetails from './BioDetails';
import { formatHeight } from '../../../utils/formatHelpers';

const BioSection = ({ player }) => (
  <BioDetails
    age={player?.age ? `${player.age.toFixed(1)} yrs` : 'N/A'}
    height={player?.heightDisplay || formatHeight(player?.height) || 'N/A'}
    weight={player?.weight ? `${player.weight} lbs` : 'N/A'}
    team={player?.currentTeam ? `${player.currentTeam} (${player.leagueType || 'N/A'})` : 'N/A'}
    nationality={player?.isInternational ? 'International' : 'USA'}
  />
);

export default BioSection;
