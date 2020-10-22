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
    
    // var promise = app.store.find('users');
    // promise.then(function(result) {
    //   console.log(result); // "Stuff worked!"
    // }, function(err) {
    //   console.log(err); // Error: "It broke"
    // });
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
      console.log("Is not Loading");
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

    this.loadResults();
  }

  
  loadUsers() {
    // console.log("TEST: " + app.
    // store.
    // all('users'));

    // app.store.find('users', {filter: {q: 'group:9'}}).then(users => console.log(users));
    // app.store.find('users', {filter: {q: 'group:CoMEIn Beta testing Group'}}).then(users => console.log(users));

    // app.store.find('users', {
    //   filter: {
    //     where: {
    //       'id': 1
    //     }
    //   },
    //   page: { size: 100 }
    // }).then(users => console.log(users));

    // app.store.find('users', {
    //   filter: {q: 'username: jonker'},
    //   page: { size: 100 }
    // }).then(users => console.log(users));

    // app.store.find('users', {
    //   filter: {q: 'id:1'},
    //   page: { size: 100 }
    // }).then(users => console.log(users));

    // app.store.find('users', {
    //   filter: {q: 'username: jonker'},
    //   page: { size: 100 }
    // }).then(users => console.log(users));

    var list = [];

    app.store.find('users', {
      page: { size: 100 }
    }).then(function(userList) {
      list.push(userList.filter(function(indiv_user) {
          var groups = indiv_user.groups();
            for (var i = 0; i < groups.length; i++) {
              if (groups[i].id() == 11) {
                return true;
              }
            }
            return false;
        }));
        console.log(list);
    });

    console.log("test");
    console.log(list);

    
  //  // app.store.find('users');
  // //  console.log("Total Length of users " + app.store.all('users').length);
  //  // var x = 0;

  //   //app.store.all('users').every(user => {
  //   const userList = app.store.all('users');
  //  // console.log("Total Length of users " + userList.entries());
  //   for (const [index, user] of userList.entries()) {

  //   //  x++;
  //     // console.log("___________");
  //     // console.log("Username: " + user.username());
  //     // console.log("Group IDs:");
  //     var groups = user.groups();
  //    // console.log(groups.length);

  //    if (this.groupName == "allDiscussions") {
  //     // console.log("Viewing users from all discussions");
  //      this.users.push(user);
  //      continue;
  //    }

  //     for (var i = 0; i < groups.length; i++) {
  //      // console.log(groups[i].id());
        
  //        // console.log(groups[i].id());
  //        // console.log(groups[i].nameSingular().replace(/\s+/g, "") + ", compared to: " + this.groupName);
          
  //         //if (groups[i].nameSingular().replace(/\s+/g, "") == this.groupName) {
  //           if (groups[i].id() == this.groupName) {
  //          // console.log("Added");
  //           this.users.push(user);
  //         }
        
  //     }
  //  // });
  //   }

   // console.log("Final user count: " + x);


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
    return this.loadUsers();
  }

  /**
   * Load the next page of discussion results.
   *
   * @public
   */
  loadMore() {
    this.loading = true;

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
