import React, { Component } from 'react';
import {
    View, Text, Image,
    StatusBar, Dimensions
} from 'react-native';
import {
    Spinner as NBSpinner, Button as NBButton, Text as NBText, Icon as NBIcon,
    Thumbnail as NBThumbnail
} from 'native-base';
import styles from './Radiostyles'
import Slider from '@react-native-community/slider';
import SafeAreaView from 'react-native-safe-area-view';
import Modulevariables from '../Modulevariables'
import * as Animatable from 'react-native-animatable';
import Spinner from 'react-native-loading-spinner-overlay';
import TrackPlayer from 'react-native-track-player';

var screen = Dimensions.get('window')

class Radio extends Component {

    intervalID; //autorefresh 1

    static navigationOptions = {
        title: 'Back',

        /**headerstyle is the view that wraps the header */
        headerStyle: {
            backgroundColor: 'black',
        },

        headerTintColor: '#ceb786',    /**color of both back button and title */

        /**styling the title */
        headerTitleStyle: {
            color: 'transparent'
        },
    }

    constructor(props) {
        super(props);

        this.state = {
            // radio_icon_state: 'play-sharp', //the state of the radio icon whether the user has pressed start or stop 
            radio_state: 'no feed',

            /**initial vlaue of our volume slide */
            volumesliderValue: 50,

            buffering_spinner: false,
        }
    }

    componentDidMount() {

        /**return default icons */
        this.setState({ radio_icon_state: 'play-sharp' })
        Modulevariables.radio_icon_state = 'play-sharp'
    }

    componentWillUnmount() {
        clearInterval(this.intervalID); //autorefresh 3
        // TrackPlayer.destroy()
    }

    start_or_stop_radio() {
        if (Modulevariables.radio_icon_state == 'play-sharp') {

            /**play */
            this.setState({ radio_icon_state: 'play-sharp' })
            Modulevariables.radio_icon_state = 'play-sharp'
            this.setState({ buffering_spinner: true })
            this.start_radio()

            /**change our icon */
            this.setState({ radio_icon_state: 'stop-sharp' })
            Modulevariables.radio_icon_state = 'stop-sharp'

        }
        else {

            /**stop radio */
            this.setState({ radio_icon_state: 'stop-sharp' })
            Modulevariables.radio_icon_state = 'stop-sharp'
            this.stop_radio()

            /**change our icon */
            this.setState({ radio_icon_state: 'play-sharp' })
            Modulevariables.radio_icon_state = 'play-sharp'

        }
    }

    start_radio = async () => {

        // https://s4.radio.co/sb0472ff73/listen
        // https://raw.githubusercontent.com/zmxv/react-native-sound-demo/master/pew2.aac
        // https://uk3.internet-radio.com/proxy/majesticjukebox?mp=/live
        // https://us3.internet-radio.com/proxy/currenthitsfm?mp=/live
        // https://uk7.internet-radio.com/proxy/radiomerge?mp=/stream
        // https://uk6.internet-radio.com/proxy/realdanceradio?mp=/live

        // Set up the player
        await TrackPlayer.setupPlayer();

        // Add a track to the queue
        await TrackPlayer.add({
            id: 'trackId',
            url: 'https://s4.radio.co/sb0472ff73/listen',
            title: 'Track Title',
            artist: 'Track Artist',
            // artwork: require('track.png')
        });

        /**after adding the link to trackplayer we wait for 2 seconds before checking the state of the player if the media is ready to play */
        setTimeout(() => {
            this.check_player_state()
        }, 5000);

    };

    /**check if the media in trackplayer is ready to play before we hide buffering spinner
     * or continue to display spinner if the media is not ready to play
     */
    check_player_state = async () => {

        const isReady = await this.get_state_of_media()   /**this is also going to another function to see if the media is actually ready */

        /**after fetching the results we can now tell if the media is ready or not */
        if (isReady) {
            // console.warn('media is ready to start playing')
            this.setState({ buffering_spinner: false })
            TrackPlayer.play()

            this.intervalID = setInterval(this.check_buffer_state.bind(this), 3000);    //autorefresh 2

        } else {
            // console.warn('media is not ready to start playing')
        }
    }

    get_state_of_media = async () => {
        const currentState = await TrackPlayer.getState()
        return currentState === TrackPlayer.STATE_READY      //State indicating that the player is ready to start playing

        // return currentState === TrackPlayer.STATE_NONE       //State indicating that no media is currently loaded
        // return currentState === TrackPlayer.STATE_READY      //State indicating that the player is ready to start playing
        // return currentState === TrackPlayer.STATE_PLAYING    //State indicating that the player is currently playing
        // return currentState === TrackPlayer.STATE_PAUSED     //State indicating that the player is currently paused
        // return currentState === TrackPlayer.STATE_STOPPED    //State indicating that the player is currently stopped
        // return currentState === TrackPlayer.STATE_BUFFERING  //State indicating that the player is currently buffering (in “play” state)
        // return currentState === TrackPlayer.STATE_CONNECTING //State indicating that the player is currently buffering (in “pause” state)
    }

    check_buffer_state = async () => {
        // console.warn('checking buffer state ...')

        const isBuffering = await this.get_media_buffering_state()

        if (isBuffering) {
            // console.warn('buffering ...')
            this.setState({ buffering_spinner: true })
        } else {
            // console.warn('not buffering ...')
            this.setState({ buffering_spinner: false })
        }
    }

    get_media_buffering_state = async () => {
        const currentState = await TrackPlayer.getState()
        return currentState === TrackPlayer.STATE_BUFFERING
    }

    stop_radio() {
        TrackPlayer.stop()
    }

    /**set volume of radio */
    setvolume(volume) {

        /**update value of volume slider */
        this.setState({ volumesliderValue: volume }, () => {

            /**react-native-trackplayer uses volume from 0 to 1
             * but our slider uses 0 to 100 step
             * hence each value in the slider should be divided by 100 so that the max volume in the slider which is 100 (divided by 100) will give us 1
             */
            volume = volume / 100
            TrackPlayer.setVolume(volume)   /**changing volume in trackplayer */
        })
    }



    render() {

        /**whenver we want to use a class for an element we add the class(id) to the curly brackets and separate them by commas */
        const { safeareaview, pagesetup, background_picture, inner_pagesetup, logo_freguency_view, logo, freq_text,
            play_stop_icon_view, play_stop_button, play_stop_icon, volume_slider_view, volume_icon } = styles

        return (

            <SafeAreaView style={styles.safeareaview}>

                <Spinner
                    overlayColor='transparent'  //background color of overlay
                    customIndicator={<Animatable.Image animation="rotate" iterationCount="infinite" source={require('../../assets/spinner.gif')} style={{ height: 45, width: 45 }} />}
                    visible={this.state.buffering_spinner}
                    textContent={'buffering ...'}   //text to display on overlay
                    textStyle={{ color: 'white' }}  //color of text
                    cancelable={true}   //allow the device back button to cancel spinner or hide it

                /**these props are only active if no customIndicator prop is used */
                // size='large'
                // color='red' //change color of spinner
                />

                <View style={styles.pagesetup}>

                    <StatusBar backgroundColor='#000000' barStyle='light-content' />

                    <Image source={require('../../assets/splash.jpg')} style={styles.background_picture} />

                    <View style={styles.inner_pagesetup}>

                        {/**tuger radio logo view */}
                        <View style={styles.logo_freguency_view}>
                            <Image source={require("../../assets/logo.jpg")} style={styles.logo} />
                            <Text style={styles.freq_text}> Infotainment at its best</Text>
                        </View>


                        {/**play/stop icon view */}
                        <View style={styles.play_stop_icon_view}>
                            <View>
                                <NBButton rounded onPress={() => { this.start_or_stop_radio() }} style={styles.play_stop_button}><NBIcon name={Modulevariables.radio_icon_state} style={styles.play_stop_icon}></NBIcon></NBButton>
                            </View>
                        </View>


                        {/**volume slider view */}
                        <View style={styles.volume_slider_view}>

                            <View style={{ flexDirection: 'row' }}>
                                <NBIcon name='volume-mute-outline' style={styles.volume_icon}></NBIcon>
                                <Slider
                                    style={{ width: (screen.width / 1.4), height: 40 }}
                                    minimumValue={0}    //minimum slider value
                                    maximumValue={100}  //maximum slider value
                                    thumbTintColor='white' //color of slider 
                                    maximumTrackTintColor="white" //color of bar when slider is at mute level
                                    minimumTrackTintColor="#ceb786" //color of bar when slider is being dragged towards high volume  
                                    step={1} //increase or decrease slider value by step
                                    value={this.state.volumesliderValue}
                                    onValueChange={(volumesliderValue) => this.setvolume(volumesliderValue)}
                                />
                                <NBIcon name='volume-high-outline' style={styles.volume_icon}></NBIcon>
                            </View>

                            <View style={{ alignItems: 'center', paddingRight: 15 }}>
                                <NBText note style={{ color: 'white' }}>Volume: {this.state.volumesliderValue}</NBText>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        );
    }
}

export default Radio;
