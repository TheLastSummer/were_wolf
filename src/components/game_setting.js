import React, { Component } from 'react';
import {
    Alert,
    AppRegistry,
    View,
    StyleSheet,
    Text,
    Dimensions,
    PixelRatio,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';



import { connect } from 'dva/mobile';
import {
    Actions
} from 'react-native-router-flux';

//此处应有一个fetch到的房间列表
import List from 'antd-mobile/lib/list';
import Stepper from 'antd-mobile/lib/stepper';
import Radio from 'antd-mobile/lib/radio';
import Button from 'antd-mobile/lib/button'
import Socket from '../services/websocket';


const RadioItem = Radio.RadioItem;
const GameSetting = (props) => {
    const {dispatch,room} = props;
    function test(){

    }
    function SetWolf(val) {
        dispatch({
            type:'room/setwolf',
            payload:val,
        });
        console.log(val);
    }
    function SetVill(val) {
        dispatch({
            type:'room/setvill',
            payload:val,
        });
    }
    function SetCupido(val) {
        dispatch({
            type:'room/setcupido',
            payload:val,
        });
    }
    function SetSeer(val) {
        dispatch({
            type:'room/setseer',
            payload:val,
        });
    }
    function SetWitch(val) {
        dispatch({
            type:'room/setwitch',
            payload:val,
        });
    }
    function SetHunter(val) {
        dispatch({
            type:'room/sethunter',
            payload:val,
        });
    }
    function SetGuard(val) {
        dispatch({
            type:'room/setguard',
            payload:val,

        });



    }
    function handleChange(val){
        dispatch({
            type:'room/setwincondition',
            payload:val,
        });
    }

    function CheckSetting(){
        if(room.Werewolf+room.Villager+room.Cupid+room.Seer+room.Witch+room.Hunter+room.Guard===room.player_num) {
            console.log('lalalalallaalal');
            sendsetting();
        }
        else {
            Alert.alert(
                '选择错误',
                '角色总数与房间人数不符！',
                [
                    {text: '好的', onPress: () => console.log('OK Pressed!')},
                ]
            );
        }
    }
    function sendsetting(){
        dispatch({
            type:'room/changeloading',
            payload:true,//此处发送消息，等待服务端返回
        });
        console.log('asdaaaaaaaa');
        if(room.hassocket)
        {
            let msg=JSON.stringify({
                type:"3",
                request_id:room.user_request_id.toString(),
                room_id:room.room_id.toString(),
                user_id:room.owner_id.toString(),
                wolf_num: room.Werewolf.toString(),
                seer_num: room.Seer.toString(),
                hunter_num:room.Hunter.toString(),
                village_num: room.Villager.toString(),
                witch_num:room.Witch.toString(),
                cupid_num: room.Cupid.toString(),
                guard_num:room.Guard.toString(),
                rule:room.WolfWinCondition.toString(),

            });
            room.socket.send(msg);
        }
        else
        {
            Alert.alert('没有socket',
                alertMessage,[
                    {text: '好的', onPress: () => console.log('OK Pressed!')},

                ]);
            dispatch({
                type:'room/changeloading',
                payload:false,
            });//没有收到消息
        }
        //Actions.seeMyself();
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <TouchableOpacity onPress={Actions.pop}>
                    <View style={styles.backContainer}>
                        <Image style={styles.backIcon}
                               source={require('../images/back.png')}/>
                        <Text style={styles.backText}>返回
                        </Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    游戏设置
                </Text>
                <TouchableOpacity onPress={CheckSetting}>
                    <View style={styles.completeContainer}>
                        <Text style={styles.completeText}>下一步
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f9' }}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
            >
            <List renderHeader = {() => '角色及人数'}>
                <List.Item extra={<Stepper max={room.player_num} min={1} value={room.Werewolf} readOnly = {false} onChange={(value) => SetWolf(value)} />}>
                    狼人
                </List.Item>
                <List.Item extra={<Stepper max={room.player_num} min={1} value={room.Villager} readOnly = {false} onChange={(value)=>SetVill(value)} />}>
                村民
                </List.Item>
                <List.Item extra={<Stepper max={1} min={0} value={room.Cupid} readOnly = {false} onChange={(value)=>SetCupido(value)} />}>
                丘比特
                </List.Item>
                <List.Item extra={<Stepper max={1} min={0} value={room.Seer} readOnly = {false} onChange={(value)=>SetSeer(value)} />}>
                预言家
                </List.Item>
                <List.Item extra={<Stepper max={1} min={0} value={room.Witch} readOnly = {false} onChange={(value)=>SetWitch(value)} />}>
                女巫
                </List.Item>
                <List.Item extra={<Stepper max={1} min={0} value={room.Hunter} readOnly = {false} onChange={(value)=>SetHunter(value)} />}>
                猎人
                </List.Item>
                <List.Item extra={<Stepper max={1} min={0} value={room.Guard} readOnly = {false} onChange={(value)=>SetGuard(value)} />}>
                    守卫
                </List.Item>
            </List>
            <List renderHeader={() => '请选择狼人胜利判定'}>
                <RadioItem checked={room.WolfWinCondition === 0}
                                               onChange={(checked)=>{
                                                   if(checked){
                                                       handleChange(0)}}}>
                    全部人死亡
                </RadioItem>

                <RadioItem checked={room.WolfWinCondition === 1}
                                               onChange={(checked)=>{
                                                   if(checked){
                                                        handleChange(1)}}}>

                    全部特殊角色死亡
                </RadioItem>
                
            </List>


            </ScrollView>
            <ActivityIndicator
                toast
                text="等待服务器"
                animating={room.loading}
            />
            </View>
    );
};

const styles = StyleSheet.create({
    //标题
    header: {
        flexDirection: 'row',
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
        height: Platform.OS === 'ios' ? PixelRatio.get() * 26 : PixelRatio.get() * 16,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        backgroundColor: '#393a3f',//#0033ff
        justifyContent: 'space-between'
    },
    //标题文本
    headerText: {
        color: '#ffffff',
        fontSize: 18,
    },
    //返回区
    backContainer: {
        flexDirection: 'row',
        marginLeft: PixelRatio.get() * 5,
        width: PixelRatio.get() * 40,
        alignItems: 'center',
        justifyContent:'flex-start',
    },
    //返回图标
    backIcon: {
        height: PixelRatio.get() * 5,
        width: PixelRatio.get() * 5,
    },
    //返回文本
    backText: {
        fontSize: 18,
        color: '#ffffff',
        marginLeft: PixelRatio.get() * 2
    },
    //完成区
    completeContainer: {
        flexDirection: 'row',
        marginRight: PixelRatio.get() * 5,
        width: PixelRatio.get() * 40,
        alignItems: 'center',
        justifyContent:'flex-end',

    },
    completeText: {
        fontSize: 18,
        color: '#ffffff'
    },

});

export default connect(room => room)(GameSetting);