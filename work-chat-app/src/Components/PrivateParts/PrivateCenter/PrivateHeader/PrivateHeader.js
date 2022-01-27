import React from 'react';
import { Header, Input } from 'semantic-ui-react';
import './PrivateHeader.css';

class PrivateHeader extends React.Component{
  render(){
    const {
      channelName,
      handleSearchChange,
      searchLoading
    } = this.props;

    return (
      <div className="privateHeader-Line">
        <Header fluid='true' as='h2' floated='left'>
        <div className="privateHeader-Name">
          <span>
            {channelName}
          </span>
          </div>
        </Header>
        <Header floated='right'>
        <div className="privateHeader-Search">
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
export default PrivateHeader;