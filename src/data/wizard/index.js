import { baseSteps } from './baseSteps';
import { photoSteps } from './photoSteps';
import { artSteps } from './artSteps';
import { clothingSteps } from './clothingSteps';
import { locationSteps } from './locationSteps';
import { characterSteps } from './characterSteps';
import { atmosphereSteps } from './atmosphereSteps';
import { qualitySteps } from './qualitySteps';
import { expressionSteps } from './expressionSteps';
import { poseSteps } from './poseSteps';
import { objectSteps } from './objectSteps';

export const WIZARD_DATA = {
    steps: {
        ...baseSteps,
        ...photoSteps,
        ...artSteps,
        ...clothingSteps,
        ...locationSteps,
        ...characterSteps,
        ...atmosphereSteps,
        ...qualitySteps,
        ...expressionSteps,
        ...poseSteps,
        ...objectSteps
    }
};
