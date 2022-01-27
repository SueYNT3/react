import React from 'react';
import { Header, Input, Icon } from 'semantic-ui-react';
import './GroupHeader.css';

class GroupHeader extends React.Component{
  render(){
    const {
      channelName,
      handleSearchChange,
      searchLoading
    } = this.props;

    return(
      <div className="groupHeader-Line">
        <Header fluid='true' as='h2' floated='left'>
        <div className="groupHeader-Name">
          <span>
            <Icon name='code'/>{channelName}
          </span>
          </div>
        </Header>
        <Header floated='right'>
        <div className="groupHeader-Search">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
            size='mini'
            icon='search'
            name='searchTerm'
            placeholder='メッセージを検索...'
          />
          </div>
        </Header>
      </div>
    );
  }
}
export default GroupHeader;