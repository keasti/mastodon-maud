import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import Avatar from './avatar';
import RelativeTimestamp from './relative_timestamp';
import DisplayName from './display_name';
import MediaGallery from './media_gallery';
import VideoPlayer from './video_player';
import AttachmentList from './attachment_list';
import StatusContent from './status_content';
import StatusActionBar from './status_action_bar';
import { FormattedMessage } from 'react-intl';
import emojify from '../emoji';
import escapeTextContentForBrowser from 'escape-html';

class Status extends React.PureComponent {
  constructor (props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
    this.handleAccountClick = this.handleAccountClick.bind(this);
  }

  handleClick () {
    const { status } = this.props;
    this.context.router.push(`/statuses/${status.getIn(['reblog', 'id'], status.get('id'))}`);
  }

  handleAccountClick (id, e) {
    if (e.button === 0) {
      e.preventDefault();
      this.context.router.push(`/accounts/${id}`);
    }
  }

  render () {
    let media = '';
    const { status, expandMedia, squareMedia, standalone, ...other } = this.props;

    if (status === null) {
      return <div />;
    }

    if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
      let displayName = status.getIn(['account', 'display_name']);

      if (displayName.length === 0) {
        displayName = status.getIn(['account', 'username']);
      }

      const displayNameHTML = { __html: emojify(escapeTextContentForBrowser(displayName)) };

      return (
        <div className='status__wrapper'>
          <div className='status__prepend'>
            <div className='status__prepend-icon-wrapper'><i className='fa fa-fw fa-retweet status__prepend-icon' /></div>
            <FormattedMessage id='status.reblogged_by' defaultMessage='{name} boosted' values={{ name: <a onClick={this.handleAccountClick.bind(this, status.getIn(['account', 'id']))} href={status.getIn(['account', 'url'])} className='status__display-name muted'><strong dangerouslySetInnerHTML={displayNameHTML} /></a> }} />
          </div>

          <Status {...other} wrapped={true} status={status.get('reblog')} />
        </div>
      );
    }

    let attachments = status.get('media_attachments');
    if (status.getIn(['pixiv_cards'], Immutable.List()).size > 0) {
      attachments = status.get('pixiv_cards').map(card => {
        return Immutable.fromJS({
          id: Math.random().toString(),
          preview_url: card.get('image_url'),
          remote_url: '',
          text_url: card.get('url'),
          type: 'image',
          url: card.get('image_url')
        });
      });
    }

    if (attachments.size > 0 && !this.props.muted) {
      if (attachments.some(item => item.get('type') === 'unknown')) {

      } else if (attachments.first().get('type') === 'video') {
        media = <VideoPlayer media={attachments.first()} sensitive={status.get('sensitive')} onOpenVideo={this.props.onOpenVideo} />;
      } else {
        media = <MediaGallery media={attachments} sensitive={status.get('sensitive')} height={squareMedia ? 229 : 132} onOpenMedia={this.props.onOpenMedia} autoPlayGif={this.props.autoPlayGif} expandMedia={expandMedia} squareMedia={squareMedia} />;
      }
    }

    let avatar = {
      href: status.getIn(['account', 'url']),
      className: 'status__display-name'
    };

    if (standalone) {
      avatar = Object.assign(avatar, {
        target: '_blank'
      });
    } else {
      avatar = Object.assign({
        onClick: this.handleAccountClick.bind(this, status.getIn(['account', 'id']))
      });
    }

    return (
      <div className={this.props.muted ? 'status muted' : 'status'}>
        <div className='status__info'>
          <div className='status__info-time'>
            <a href={status.get('url')} className='status__relative-time' target='_blank' rel='noopener'><RelativeTimestamp timestamp={status.get('created_at')} /></a>
          </div>

          <a {...avatar}>
            <div className='status__avatar'>
              <Avatar src={status.getIn(['account', 'avatar'])} staticSrc={status.getIn(['account', 'avatar_static'])} size={48} />
            </div>

            <DisplayName account={status.get('account')} />
          </a>
        </div>

        <StatusContent standalone status={status} onClick={this.handleClick} />

        {media}

        {!standalone && <StatusActionBar {...this.props} />}
      </div>
    );
  }

}

Status.contextTypes = {
  router: PropTypes.object
};

Status.propTypes = {
  status: ImmutablePropTypes.map,
  wrapped: PropTypes.bool,
  onReply: PropTypes.func,
  onFavourite: PropTypes.func,
  onReblog: PropTypes.func,
  onDelete: PropTypes.func,
  onOpenMedia: PropTypes.func,
  onOpenVideo: PropTypes.func,
  onBlock: PropTypes.func,
  me: PropTypes.number,
  boostModal: PropTypes.bool,
  autoPlayGif: PropTypes.bool,
  muted: PropTypes.bool,
  expandMedia: PropTypes.bool,
  squareMedia: PropTypes.bool,
  standalone: PropTypes.bool
};

export default Status;
