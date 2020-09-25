import Component from '../../common/Component';
import UserListItem from './UserListItem';
import Button from '../../common/components/Button';
import LoadingIndicator from '../../common/components/LoadingIndicator';
import Placeholder from '../../common/components/Placeholder';
import Group from '../../common/models/Group';

/**
 * The `DiscussionList` component displays a list of discussions.
 *
 * ### Props
 *
 * - `params` A map of parameters used to construct a refined parameter object
 *   to send along in the API request to get discussion results.
 */
export default class GroupUserList extends Component {
  init() {
    /**
     * Whether or not discussion results are loading.
     *
     * @type {Boolean}
     */
    this.loading = true;

    /**
     * Whether or not there are more results that can be loaded.
     *
     * @type {Boolean}
     */
    this.moreResults = false;

    /**
     * The discussions in the discussion list.
     *
     * @type {Discussion[]}
     */
    this.users = [];
    this.groupName = "";

    this.refresh();

    // window.alert(this.props.params.q);
    // window.alert(this.props.params.sort);
    
  }

  view() {
    const params = this.props.params;
    let loading;

    if (this.loading) {
      loading = LoadingIndicator.component();
    } else if (this.moreResults) {
      loading = Button.component({
        children: app.translator.trans('core.forum.discussion_list.load_more_button'),
        className: 'Button',
        onclick: this.loadMore.bind(this)
      });
    }

    if (this.users.length === 0 && !this.loading) {
      //window.alert("Is not loading");
      const text = app.translator.trans('core.forum.discussion_list.empty_text');
      return (
        <div className="DiscussionList">
          {Placeholder.component({text})}
        </div>
      );
    }

    return (
      <div className={'DiscussionList'}>
        <ul className="DiscussionList-discussions">
          {this.users.map(user => {
            return (
              <li key={user.id()} data-id={user.id()}>
                {UserListItem.component({user, params})}
              </li>
            );
          })}
        </ul>
        <div className="DiscussionList-loadMore">
          {loading}
        </div>
      </div>
    );
  }

  /**
   * Get the parameters that should be passed in the API request to get
   * discussion results.
   *
   * @return {Object}
   * @api
   */
  requestParams() {
    // const params = {include: ['user', 'lastPostedUser'], filter: {}};

    // params.sort = this.sortMap()[this.props.params.sort];

    // if (this.props.params.q) {
    //   params.filter.q = this.props.params.q;

    //   params.include.push('mostRelevantPost', 'mostRelevantPost.user');
    // }

   // return params;

   return {};
  }

  /**
   * Get a map of sort keys (which appear in the URL, and are used for
   * translation) to the API sort value that they represent.
   *
   * @return {Object}
   */
  sortMap() {
    const map = {};

    if (this.props.params.q) {
      map.relevance = '';
    }
    map.latest = '-lastPostedAt';
    map.top = '-alphanumericOrder';

    return map;
  }

  /**
   * Clear and reload the discussion list.
   *
   * @public
   */
  refresh(newGroupName, clear = true) {
    if (clear) {
      this.loading = true;
      this.users = [];
    }

    this.groupName = newGroupName;
    // return this.loadResults().then(
    //   results => {
    //     this.users = [];
    //     this.parseResults(results);
    //   },
    //   () => {
    //     this.loading = false;
    //     m.redraw();
    //   }
    // );

    this.loadResults();
  }

  loadUsers() {
    // app.store.all('groups').some(group => {
    //   // if ((group.nameSingular() === this.props.params.groupName)) {
    //   //   console.log("A  " + this.props.params.groupName);
    
    //   var updatedGroup = group.nameSingular().replace(/\s+/g, "");
    // //  console.log(updatedGroup + ", compare to: " + this.groupName);

    //   if (updatedGroup === this.groupName) {
    //     console.log("A  " + this.groupName);

    //     app.store.all('users').some(user => {
    //       console.log(user.groups().length);
    //       var groups = user.groups();
    //       for (var i = 0; i < groups.length; i++) {
    //         //console.log("Group: " + groups[i].nameSingular());
    //         if (groups[i].id() == group.id()) {
    //             console.log("Added: " + user.user)
    //             this.users.push(user);
    //         }
    //       }
    //     });

    //   }
    // });

    console.log("B " + app.store.all('users').length);
    app.store.all('users').some(user => {
      console.log(user.username());
      var groups = user.groups();
      console.log(groups.length);
      for (var i = 0; i < groups.length; i++) {
        console.log(groups[i].nameSingular().replace(/\s+/g, "") + ", compared to: " + this.groupName);
        if (groups[i].nameSingular().replace(/\s+/g, "") == this.groupName) {
          console.log("Added");
          this.users.push(user);
        }
      }
    });


    this.loading = false;
    m.lazyRedraw();
    this.moreResults = false;
    m.redraw();
  }

  /**
   * Load a new page of discussion results.
   *
   * @param {Integer} offset The index to start the page at.
   * @return {Promise}
   */
  loadResults(/*offset*/) {
    // const preloadedDiscussions = app.preloadedApiDocument();

    // if (preloadedDiscussions) {
    //   window.alert("Did not run as intended");
    //   return m.deferred().resolve(preloadedDiscussions).promise;
    // }


    return this.loadUsers();

  //  const params = this.requestParams();
  //  params.page = {offset};
   // params.include = params.include.join(',');

  //  return app.store.find('discussions', params);
  
  }

  /**
   * Load the next page of discussion results.
   *
   * @public
   */
  loadMore() {
    this.loading = true;

    // this.loadResults(this.discussions.length)
    //   .then(this.parseResults.bind(this));
    this.loadResults();
  }

  /**
   * Parse results and append them to the discussion list.
   *
   * @param {Discussion[]} results
   * @return {Discussion[]}
   */
  parseResults(results) {
    [].push.apply(this.users, results);

    this.loading = false;
    this.moreResults = !!results.payload.links.next;

    m.lazyRedraw();

    return results;
  }

  /**
   * Remove a discussion from the list if it is present.
   *
   * @param {Discussion} discussion
   * @public
   */
  removeDiscussion(discussion) {
    const index = this.discussions.indexOf(discussion);

    if (index !== -1) {
      this.discussions.splice(index, 1);
    }
  }

  /**
   * Add a discussion to the top of the list.
   *
   * @param {Discussion} discussion
   * @public
   */
  addDiscussion(discussion) {
    this.discussions.unshift(discussion);
  }
}
