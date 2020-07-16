const ENABLE_VITAE_POST = 'ENABLE_VITAE_POST';
const DISABLE_VITAE_POST = 'DISABLE_VITAE_POST';

const enableVitaePost = () => {
  return {
    type: ENABLE_VITAE_POST,
  };
};

const disableVitaePost = () => {
  return {
    type: DISABLE_VITAE_POST,
  };
};

export { ENABLE_VITAE_POST, DISABLE_VITAE_POST, enableVitaePost, disableVitaePost };
