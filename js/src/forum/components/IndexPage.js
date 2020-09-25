import { extend } from '../../common/extend';
import Page from './Page';
import ItemList from '../../common/utils/ItemList';
import listItems from '../../common/helpers/listItems';
import icon from '../../common/helpers/icon';
import DiscussionList from './DiscussionList';
import WelcomeHero from './WelcomeHero';
import DiscussionComposer from './DiscussionComposer';
import LogInModal from './LogInModal';
import DiscussionPage from './DiscussionPage';
import Dropdown from '../../common/components/Dropdown';
import Button from '../../common/components/Button';
import LinkButton from '../../common/components/LinkButton';
import SelectDropdown from '../../common/components/SelectDropdown';
import GroupUserList from './GroupUserList';

/**
 * The `IndexPage` component displays the index page, including the welcome
 * hero, the sidebar, and the discussion list.
 */
export default class IndexPage extends Page {
  init() {
    super.init();

    // If the user is returning from a discussion page, then take note of which
    // discussion they have just visited. After the view is rendered, we will
    // scroll down so that this discussion is in view.
    if (app.previous instanceof DiscussionPage) {
      this.lastDiscussion = app.previous.discussion;
      app.cache.viewingUserList = false;
    }

    // If the user is coming from the discussion list, then they have either
    // just switched one of the parameters (filter, sort, search) or they
    // probably want to refresh the results. We will clear the discussion list
    // cache so that results are reloaded.
    if (app.previous instanceof IndexPage) {
      app.cache.discussionList = null;
    }

    const params = this.params();

    if (app.cache.discussionList) {
      // Compare the requested parameters (sort, search query) to the ones that
      // are currently present in the cached discussion list. If they differ, we
      // will clear the cache and set up a new discussion list component with
      // the new parameters.
      Object.keys(params).some(key => {
        if (app.cache.discussionList.props.params[key] !== params[key]) {
          app.cache.discussionList = null;
          return true;
        }
      });
    }

    if (!app.cache.discussionList) {
      app.cache.discussionList = new DiscussionList({params});

      app.cache.currentPage = "allDiscussions";
    }
    if (!app.cache.groupUserList) {
     // this.params.groupName = "Admin";
      app.cache.groupUserList = new GroupUserList({params});
    }

    app.history.push('index', app.translator.trans('core.forum.header.back_to_index_tooltip'));

    this.bodyClass = 'App--index';




    //console.log(app.history.getCurrent());

    // if (!app.cache.setOnClickfunction) {
    //   app.cache.setOnClickfunction = true;
    //   var navItems = this.navItems(this);
    //   //console.log(navItems.length);
    //   // for (var i = 0; i < navItems.toArray().length; i++) {
    //   // // navItems[i].onclick = console.log(navItems[i].itemName);
    //   //   // navItems[i].onclick = function() {
    //   //   //   console.log("G");
    //   //   // };

    //   //  // console.log(navItems.get("allDiscussions"));
    //   //  navItems.get("allDiscussions").onclick = function() {
    //   //    console.log("Test");
    //   //  };
    //   // }

    //   navItems.get("allDiscussions").onclick = console.log("Test");
    // }
  }

  onunload() {
    // Save the scroll position so we can restore it when we return to the
    // discussion list.
    app.cache.scrollTop = $(window).scrollTop();
  }

  view() {
    return (
      <div className="IndexPage">
        {this.hero()}
        <div className="container">
          <div className="sideNavContainer">
            <nav className="IndexPage-nav sideNav">
              <ul>{listItems(this.sidebarItems().toArray())}</ul>
            </nav>
            <div className="IndexPage-results sideNavOffset">
              <div className="IndexPage-toolbar">
                <ul className="IndexPage-toolbar-view">{listItems(this.viewItems().toArray())}</ul>
                <ul className="IndexPage-toolbar-action">{listItems(this.actionItems().toArray())}</ul>
              </div>
              {app.cache.viewingUserList ? app.cache.groupUserList.render() : app.cache.discussionList.render()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  config(isInitialized, context) {
    super.config(...arguments);

    if (isInitialized) return;

    extend(context, 'onunload', () => $('#app').css('min-height', ''));

    app.setTitle('');
    app.setTitleCount(0);

    // Work out the difference between the height of this hero and that of the
    // previous hero. Maintain the same scroll position relative to the bottom
    // of the hero so that the sidebar doesn't jump around.
    const oldHeroHeight = app.cache.heroHeight;
    const heroHeight = app.cache.heroHeight = this.$('.Hero').outerHeight() || 0;
    const scrollTop = app.cache.scrollTop;

    $('#app').css('min-height', $(window).height() + heroHeight);

    // Scroll to the remembered position. We do this after a short delay so that
    // it happens after the browser has done its own "back button" scrolling,
    // which isn't right. https://github.com/flarum/core/issues/835
    const scroll = () => $(window).scrollTop(scrollTop - oldHeroHeight + heroHeight);
    scroll();
    setTimeout(scroll, 1);

    // If we've just returned from a discussion page, then the constructor will
    // have set the `lastDiscussion` property. If this is the case, we want to
    // scroll down to that discussion so that it's in view.
    if (this.lastDiscussion) {
      const $discussion = this.$(`.DiscussionListItem[data-id="${this.lastDiscussion.id()}"]`);

      if ($discussion.length) {
        const indexTop = $('#header').outerHeight();
        const indexBottom = $(window).height();
        const discussionTop = $discussion.offset().top;
        const discussionBottom = discussionTop + $discussion.outerHeight();

        if (discussionTop < scrollTop + indexTop || discussionBottom > scrollTop + indexBottom) {
          $(window).scrollTop(discussionTop - indexTop);
        }
      }
    }
  }

  /**
   * Get the component to display as the hero.
   *
   * @return {MithrilComponent}
   */
  hero() {
    return WelcomeHero.component();
  }

  /**
   * Build an item list for the sidebar of the index page. By default this is a
   * "New Discussion" button, and then a DropdownSelect component containing a
   * list of navigation items.
   *
   * @return {ItemList}
   */
  sidebarItems() {
    const items = new ItemList();
    const canStartDiscussion = app.forum.attribute('canStartDiscussion') || !app.session.user;

    items.add('newDiscussion',
      Button.component({
        children: app.translator.trans(canStartDiscussion ? 'core.forum.index.start_discussion_button' : 'core.forum.index.cannot_start_discussion_button'),
        icon: 'fas fa-edit',
        className: 'Button Button--primary IndexPage-newDiscussion',
        itemClassName: 'App-primaryControl',
        onclick: this.newDiscussionAction.bind(this),
        disabled: !canStartDiscussion
      })
    );

    // console.log(this.navItems(this).toArray().length);
    // for (var i = 0; i < this.navItems(this).toArray().length; i++) {
    //   this.navItems(this).toArray()[i].onclick = console.log(this.navItems(this).toArray()[i].itemName);
    // }

    items.add('nav',
      SelectDropdown.component({
        children: this.navItems(this).toArray(),
        buttonClassName: 'Button',
        className: 'App-titleControl'
      })
    );




    // const selectorsNames = ['allDiscussions', 'CoMEIn Beta testing Group', 'CoMEIn Beta User Group', 'UIUC Researchers Group', 'Mentoring_Group'];
    // const selectorIds = ['item-allDiscussions', 'item-tag14', 'item-tag8', 'item-tag9', 'item-tag1'];

    // selectorIds.forEach(element => {
    //   var item = document.getElementsByClassName(element);
    //   console.log(item);

    //   // item.addEventListener('click', (event) => {
    //   //   //console.log(event.target.textContent);
    //   //   //controller.copyToClipboard(event.target.textContent)

    //   // })
    //   if (item.getAttribute('class').includes('active')) {
    //     console.log(element);
    //   }
    // })

    return items;
  }

  /**
   * Build an item list for the navigation in the sidebar of the index page. By
   * default this is just the 'All Discussions' link.
   *
   * @return {ItemList}
   */
  navItems() {
    const items = new ItemList();
    const params = this.stickyParams();

    items.add('allDiscussions',
      LinkButton.component({
        href: app.route('index', params),
        children: app.translator.trans('core.forum.index.all_discussions_link'),
        icon: 'far fa-comments',
        onclick: () => {
          app.cache.viewingUserList = false;
          app.cache.discussionList.refresh();
          m.redraw();
        }
      }),
      100
    );

    //window.alert("Length: " + items.toArray().length);
    return items;
  }

  /**
   * Build an item list for the part of the toolbar which is concerned with how
   * the results are displayed. By default this is just a select box to change
   * the way discussions are sorted.
   *
   * @return {ItemList}
   */
  viewItems() {
    const items = new ItemList();
    const sortMap = app.cache.discussionList.sortMap();

    const sortOptions = {};
    for (const i in sortMap) {
      sortOptions[i] = app.translator.trans('core.forum.index_sort.' + i + '_button');
    }

    items.add('sort',
      Dropdown.component({
        buttonClassName: 'Button',
        label: sortOptions[this.params().sort] || Object.keys(sortMap).map(key => sortOptions[key])[0],
        children: Object.keys(sortOptions).map(value => {
          const label = sortOptions[value];
          const active = (this.params().sort || Object.keys(sortMap)[0]) === value;

          return Button.component({
            children: label,
            icon: active ? 'fas fa-check' : true,
            onclick: () => {
              this.changeSort.bind(this, value);
              app.cache.viewingUserList = false;
            },
            active: active,
          })
        }),
      })
    );

    items.add('users',
    Button.component({
      children: 'Users',
      className: 'Button',
      onclick: () => {
        // app.cache.discussionList.refresh();
        // if (app.session.user) {
        //   app.store.find('users', app.session.user.id());
        //   m.redraw();
        // }


       // this.params.groupNamme = 
      //  this.params.groupName = "Admin";

      app.cache.viewingUserList = true;

      console.log(app.history.getCurrent().url);
      const itemNames = [/*'allDiscussions',*/ 'CoMEInBetatestingGroup', 'CoMEInBetaUserGroup', 'UIUCResearchersGroup', 'Mentoring_Group'];
      const urlNames = [/*'/public/all', */'/public/t/comein-beta-testing-group', '/public/t/comein-beta-user-group', '/public/t/uiuc-researchers-group', '/public/t/mentoring-group'];
      for (var i = 0; i < urlNames.length; i++) {
        console.log("Running");
        if (app.history.getCurrent().url == urlNames[i]) {
          //console.log(itemNames[i]);
         // this.params.groupName = itemNames[i];
          app.cache.groupUserList.refresh(itemNames[i]);
          break;
        }
      }

        
        // app.cache.groupUserList.refresh(itemNames[i]);
        m.redraw();
        
       // m.route(app.route(this.props.routeName, params))
      }
    })
  );

    return items;
  }

  /**
   * Build an item list for the part of the toolbar which is about taking action
   * on the results. By default this is just a "mark all as read" button.
   *
   * @return {ItemList}
   */
  actionItems() {
    const items = new ItemList();

    items.add('refresh',
      Button.component({
        title: app.translator.trans('core.forum.index.refresh_tooltip'),
        icon: 'fas fa-sync',
        className: 'Button Button--icon',
        onclick: () => {
          app.cache.viewingUserList = false;
          app.cache.discussionList.refresh();
          if (app.session.user) {
            app.store.find('users', app.session.user.id());
            m.redraw();
          }
        }
      })
    );

    if (app.session.user && !app.cache.viewingUserList) {
      items.add('markAllAsRead',
        Button.component({
          title: app.translator.trans('core.forum.index.mark_all_as_read_tooltip'),
          icon: 'fas fa-check',
          className: 'Button Button--icon',
          onclick: this.markAllAsRead.bind(this)
        })
      );
    }

    return items;
  }

  /**
   * Return the current search query, if any. This is implemented to activate
   * the search box in the header.
   *
   * @see Search
   * @return {String}
   */
  searching() {
    return this.params().q;
  }

  /**
   * Redirect to the index page without a search filter. This is called when the
   * 'x' is clicked in the search box in the header.
   *
   * @see Search
   */
  clearSearch() {
    const params = this.params();
    delete params.q;

    m.route(app.route(this.props.routeName, params));
  }

  /**
   * Redirect to the index page using the given sort parameter.
   *
   * @param {String} sort
   */
  changeSort(sort) {
    const params = this.params();

    if (sort === Object.keys(app.cache.discussionList.sortMap())[0]) {
      delete params.sort;
    } else {
      params.sort = sort;
    }

    m.route(app.route(this.props.routeName, params));
  }

  /**
   * Get URL parameters that stick between filter changes.
   *
   * @return {Object}
   */
  stickyParams() {
    return {
      sort: m.route.param('sort'),
      q: m.route.param('q')
    };
  }

  /**
   * Get parameters to pass to the DiscussionList component.
   *
   * @return {Object}
   */
  params() {
    const params = this.stickyParams();

    params.filter = m.route.param('filter');

    // if (!params.groupName) {
    //   params.groupName = "Admin";
    // }

    return params;
  }

  /**
   * Open the composer for a new discussion or prompt the user to login.
   *
   * @return {Promise}
   */
  newDiscussionAction() {
    const deferred = m.deferred();

    if (app.session.user) {
      const component = new DiscussionComposer({ user: app.session.user });

      app.composer.load(component);
      app.composer.show();

      deferred.resolve(component);
    } else {
      deferred.reject();

      app.modal.show(new LogInModal());
    }

    return deferred.promise;
  }

  /**
   * Mark all discussions as read.
   *
   * @return void
   */
  markAllAsRead() {
    const confirmation = confirm(app.translator.trans('core.forum.index.mark_all_as_read_confirmation'));

    if (confirmation) {
      app.session.user.save({markedAllAsReadAt: new Date()});
    }
  }
}
