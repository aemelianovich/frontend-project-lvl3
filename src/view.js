/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import i18n from 'i18next';
import _ from 'lodash';
import { stateStatuses, processMsgTypes } from './constants.js';

const getMsg = (msgType) => {
  switch (msgType) {
    case processMsgTypes.networkError:
      return i18n.t('feedback.networkError');
    case processMsgTypes.invalidFeed:
      return i18n.t('feedback.invalidFeed');
    case processMsgTypes.invalidUrl:
      return i18n.t('feedback.invalidUrl');
    case processMsgTypes.existsRss:
      return i18n.t('feedback.existsRss');
    case processMsgTypes.undefined:
      return i18n.t('feedback.undefined');
    default:
      console.log(new Error(`Undefined message type: ${msgType}`));
      return i18n.t('feedback.undefined');
  }
};

const processStateHandler = (state, pageElements, processState) => {
  const { rssForm, feedback } = pageElements;

  switch (processState) {
    case stateStatuses.init:
      pageElements.title.textContent = i18n.t('title');
      pageElements.desc.textContent = i18n.t('description');
      pageElements.example.textContent = `${i18n.t('example')} https://ru.hexlet.io/lessons.rss`;
      pageElements.rssForm.input.setAttribute('placeholder', i18n.t('rssForm.placeholder'));
      pageElements.rssForm.submit.textContent = i18n.t('rssForm.submit');
      pageElements.modal.querySelector('.full-article').textContent = i18n.t('modal.article');
      pageElements.modal.querySelector('.btn-secondary').textContent = i18n.t('modal.close');

      break;
    case stateStatuses.processing:
      rssForm.input.classList.remove('is-invalid');

      rssForm.fieldset.disabled = true;

      feedback.classList.remove('text-danger');
      feedback.classList.remove('text-success');
      feedback.textContent = i18n.t('feedback.submittingRSS');
      break;
    case stateStatuses.invalid:
      rssForm.input.classList.add('is-invalid');

      rssForm.fieldset.disabled = false;
      rssForm.input.focus();

      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');

      feedback.textContent = getMsg(state.rssForm.processMsgType);
      break;
    case stateStatuses.failed:
      rssForm.input.classList.remove('is-invalid');
      rssForm.fieldset.disabled = false;
      rssForm.input.focus();

      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');

      feedback.textContent = getMsg(state.rssForm.processMsgType);
      break;
    case stateStatuses.success:
      rssForm.input.classList.remove('is-invalid');

      rssForm.fieldset.disabled = false;

      rssForm.input.value = '';
      rssForm.input.focus();

      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');

      feedback.textContent = i18n.t('feedback.addedRss');
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const renderFeeds = (feeds, feedsEl) => {
  if (feeds.length === 0) {
    feedsEl.innerHTML = '';
  }

  const titleEl = document.createElement('h2');
  titleEl.textContent = i18n.t('feeds.title');

  const listEl = document.createElement('ul');
  listEl.classList.add('list-group', 'mb-5');

  const itemEls = feeds.map((feed) => {
    const itemEl = document.createElement('li');
    itemEl.classList.add('list-group-item');

    const h3El = document.createElement('h3');
    h3El.textContent = feed.title;

    const pEl = document.createElement('p');
    pEl.textContent = feed.desc;

    itemEl.appendChild(h3El);
    itemEl.appendChild(pEl);

    return itemEl;
  });

  listEl.prepend(...itemEls);
  const feedsFragment = document.createDocumentFragment();
  feedsFragment.appendChild(titleEl);
  feedsFragment.appendChild(listEl);

  feedsEl.innerHTML = '';
  feedsEl.appendChild(feedsFragment);
};

const renderPosts = (posts, postsEl, viewedPosts) => {
  if (posts.length === 0) {
    postsEl.innerHTML = '';
  }

  const titleEl = document.createElement('h2');
  titleEl.textContent = i18n.t('posts.title');

  const listEl = document.createElement('ul');
  listEl.classList.add('list-group');

  const itemEls = posts
    .map((post) => {
      const itemEl = document.createElement('li');
      itemEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

      const aEl = document.createElement('a');
      aEl.href = post.link;
      if (viewedPosts.has(post.id)) {
        aEl.classList.add('font-weight-normal');
      } else {
        aEl.classList.add('font-weight-bold');
      }

      aEl.setAttribute('data-id', post.id);
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
      aEl.textContent = post.title;

      const buttonEl = document.createElement('button');
      buttonEl.type = 'button';
      buttonEl.classList.add('btn', 'btn-primary', 'btn-sm');
      buttonEl.setAttribute('data-id', post.id);
      buttonEl.setAttribute('data-toggle', 'modal');
      buttonEl.setAttribute('data-target', '#modal');
      buttonEl.textContent = i18n.t('posts.preview');

      itemEl.appendChild(aEl);
      itemEl.appendChild(buttonEl);

      return itemEl;
    });

  listEl.prepend(...itemEls);
  const postsFragment = document.createDocumentFragment();
  postsFragment.appendChild(titleEl);
  postsFragment.appendChild(listEl);

  postsEl.innerHTML = '';
  postsEl.appendChild(postsFragment);
};

const renderModal = (posts, modal, modalEl) => {
  const postPreview = _.find(posts, { id: modal.id });
  modalEl.querySelector('.modal-title').textContent = postPreview.title;
  modalEl.querySelector('.modal-body').textContent = postPreview.desc;
  modalEl.querySelector('.full-article').href = postPreview.link;
};

export default (state, pageElements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.processState':
        processStateHandler(state, pageElements, value);
        break;
      case 'data.feeds':
        renderFeeds(state.data.feeds, pageElements.feeds);
        break;
      case 'data.posts':
        renderPosts(state.data.posts, pageElements.posts, state.ui.viewedPosts);
        break;
      case 'ui.viewedPosts':
        renderPosts(state.data.posts, pageElements.posts, state.ui.viewedPosts);
        break;
      case 'modal':
        renderModal(watchedState.data.posts, state.modal, pageElements.modal);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
