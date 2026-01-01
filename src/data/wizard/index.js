import { baseSteps } from './baseSteps';
import { amateurSteps } from './amateurSteps';

export const WIZARD_DATA = {
    steps: {
        ...baseSteps,
        ...amateurSteps
    }
};
